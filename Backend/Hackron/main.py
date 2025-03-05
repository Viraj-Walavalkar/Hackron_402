import asyncio
import json
from bson import ObjectId
from fastapi import BackgroundTasks, FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from models import InventoryItem
from database import products, cart_collection
from schemas import BuyRequest, InventoryItemCreate, InventoryItemUpdate, ProductCreate, ProductCreateRequest, ProductResponse , Cart, CartItem, Subscription , discountResponse , GetCart
from pymongo.errors import PyMongoError
from utils import calculate_discount, calculate_days_left , calculate_demand , get_or_create_cart
import threading
from pywebpush import webpush, WebPushException



# CORS setup
app = FastAPI()

origins = [
    "http://localhost",  # Allow localhost for development
    "http://localhost:3000",  # If you use a frontend running on port 3000
    "https://your-frontend-domain.com",
    "http://localhost:5173",
    "*"  # Replace with your actual frontend domain if deployed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests from the above origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

VAPID_PUBLIC_KEY = "BCtQT0UqM38b2ZdlS3_6TXxpXGLgFxLCKc2gax5-zutj9nDtw8NruviQplkprBvBq6GOsW3tuDxQo_2fwzhOSAI"
VAPID_PRIVATE_KEY = "MXGhDQuyPNKGabCf8gRviCVK9GSxnx6YH4CmDvf2WEk"
VAPID_EMAIL = "mailto:prajwalpohane678@gmail.com"

@app.get("/inventory", response_model=List[ProductResponse])
async def get_inventory(category: Optional[str] = Query(None, description="Filter by category")):
    query = {}
    if category:
        query["category"] = category  # Filter by category if provided

    items = await products.find(query).to_list(None)  # Fetch products based on the filter

    if not items:
        raise HTTPException(status_code=404, detail="No products found")

    return [
        ProductResponse(
            id=str(item["_id"]),
            name=item["name"],
            price=item["price"],
            quantity=item["quantity"],
            expiry=item["expiry"],
            description=item["description"],
            discount=item.get("discount", 0.0),
            listing_date=item["listing_date"],
            category = item["category"],
            image = item["image"]
        )
        for item in items
    ]

@app.post("/inventory")
async def create_inventory_item(item: ProductCreateRequest):
    try:
        item_dict = item.model_dump()
        result = await products.insert_one(item_dict)
        return {"inserted_id": str(result.inserted_id)}
    except PyMongoError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.post("/buy", response_model=ProductResponse)
async def buy_product(request: BuyRequest):
    try:
        product = await products.find_one({"_id": ObjectId(request.id)})

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if product["quantity"] < request.quantity:
            raise HTTPException(status_code=400, detail="Not enough stock available")

        # Deduct quantity and update DB
        updated_quantity = product["quantity"] - request.quantity
        await products.update_one(
            {"_id": ObjectId(request.id)},
            {"$set": {"quantity": updated_quantity}}
        )

        # Fetch updated product details
        updated_product = await products.find_one({"_id": ObjectId(request.id)})

        return {
            "id": str(updated_product["_id"]),
            "name": updated_product["name"],
            "price": updated_product["price"],
            "quantity": updated_product["quantity"],
            "expiry": updated_product["expiry"],
            "description": updated_product["description"],
            "discount": updated_product.get("discount", 0.0),
            "listing_date": updated_product["listing_date"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def update_discounts_task():
    cursor = products.find()
    p = await cursor.to_list(length=None)
    for product in p:
        days_left = calculate_days_left(product["expiry"])
        print(days_left)
        demand = calculate_demand(days_since= product["listing_date"] , sold_quantity=(100-product["quantity"]))
        discount = calculate_discount(days_left=days_left, stock_available= product["quantity"],total_stock= 100,demand_factor= 0.3)
        await products.update_one({"_id": product["_id"]}, {"$set": {"discount": discount}})

async def periodic_discount_update():
    while True:
        await update_discounts_task()
        await asyncio.sleep(10)  

@app.get("/update_discounts")
async def update_discounts(background_tasks: BackgroundTasks):
    background_tasks.add_task(update_discounts_task)
    return {"message": "Discount update started"}

# Run periodic update task at startup
@app.on_event("startup")
async def startup_event():
    print("Starting periodic discount updates...") 
    asyncio.create_task(periodic_discount_update())
    
@app.post("/cart", response_model=Cart)
async def create_cart(cart: Cart):
    await cart.calculate_total_price()
    existing_cart = await cart_collection.find_one({"_id": cart._id})
    if existing_cart:
        await cart_collection.update_one({"_id": cart._id}, {"$set": cart.dict()})
    else:
        await cart_collection.insert_one(cart.dict())
    return cart

@app.post("/cart/add")
async def add_item_to_cart(item: CartItem):
    cart = await cart_collection.find_one({"_id": "cart"})
    if not cart:
        cart = Cart()
    else:
        cart = Cart(**cart)
    
    for existing_item in cart.items:
        if existing_item.product_id == item.product_id:
            existing_item.quantity += item.quantity
            break
    else:
        cart.items.append(item)
    
    await cart.calculate_total_price()
    await cart_collection.update_one({"_id": "cart"}, {"$set": cart.dict()}, upsert=True)
    return cart


# Remove Item from Cart
@app.post("/remove_from_cart")
async def remove_from_cart(product_id: str):
    cart = await cart_collection.find_one({"_id": "cart"})
    if not cart:
        cart = Cart()
    else:
        cart = Cart(**cart)
        
    for existing_items in cart.items:
        if existing_items.product_id == product_id:
            cart.items.remove(existing_items)
            
            break
    print(cart.items)
    await cart.calculate_total_price()

    await cart_collection.update_one({"_id": "cart"}, {"$set": cart.model_dump()})
    return {"message": "Item removed successfully", "cart": cart}

# Buy Cart (Reset Cart)
@app.post("/buy_cart")
async def buy_cart():
    cart = await cart_collection.find_one({"_id": "cart"})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")

    for item in cart["items"]:
        product_id = item["product_id"]
        quantity_to_buy = item["quantity"]

        # Fetch product from DB
        product = await products.find_one({"_id": ObjectId(product_id)})

        if not product:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

        available_stock = product.get("quantity", 0)

        if available_stock < quantity_to_buy:
            raise HTTPException(status_code=400, detail=f"Not enough stock for product {product_id}")

        # Reduce product quantity in DB
        await products.update_one(
            {"_id": ObjectId(product_id)},
            {"$inc": {"quantity": -quantity_to_buy}}
        )

    await cart_collection.update_one({"_id": "cart"}, {"$set": {"items": []}})

    return {"message": "Purchase successful", "purchased_items": cart["items"]}
    

    
@app.get("/get_cart")
async def get_cart():
    cart = await cart_collection.find_one({"_id": "cart"})
    if not cart:
        cart = Cart()
    else:
        cart = Cart(**cart)
    
    get_cart = GetCart()
    
    print(cart.items)
    for item in cart.items:
        response = discountResponse()
        data = await products.find_one({"_id" : ObjectId(item.product_id)})

        response.product_id = item.product_id
        response.name = data["name"]
        response.price = data["price"]
        response.quantity = item.quantity
        response.discount = data["discount"]
        get_cart.items.append(response)
        
    return get_cart.__dict__


subscriptions = []

@app.post("/subscribe/")
def subscribe(subscription: Subscription):
    """Store subscription in the backend."""
    subscriptions.append(subscription.dict())
    return {"message": "Subscription added successfully"}

@app.post("/send-notification/")
def send_notification(title: str, message: str):
    """Send a notification to all subscribed clients."""
    payload = json.dumps({"title": title, "body": message, "icon": "/icon.png"})
    
    for sub in subscriptions:
        try:
            webpush(
                subscription_info=sub,
                data=payload,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": VAPID_EMAIL},
            )
        except WebPushException as ex:
            print(f"Error sending notification: {ex}")
    
    return {"message": "Notifications sent successfully"}




@app.put("/inventory/{item_id}", response_model=InventoryItem)
async def update_inventory_item(item_id: str, item: InventoryItemUpdate):
    updated_item = await products.find_one_and_update(
        {"_id": item_id}, {"$set": item.dict()}, return_document=True
    )
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item

@app.delete("/inventory/{item_id}")
async def delete_inventory_item(item_id: str):
    deleted_item = await products.find_one_and_delete({"_id": item_id})
    if not deleted_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

@app.get("/inventory/{item_id}", response_model=InventoryItem)
async def get_inventory_item(item_id: str):
    item = await products.find_one({"_id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
