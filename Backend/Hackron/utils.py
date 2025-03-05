from datetime import datetime
from database import cart_collection
from schemas import Cart

def calculate_discount(days_left, stock_available, total_stock=100, demand_factor=0.3, W1=15, W2=10, W3=5):
    if days_left <= 0:
        return 100
    
    stock_ratio = stock_available / total_stock if total_stock > 0 else 1
    
    discount = ((W1 / (days_left + 1)) + 
                (W2 * (1 - stock_ratio)) + 
                (W3 * (1 - demand_factor)))
    
    return min(max(discount, 0), 100)

def calculate_demand(days_since , sold_quantity):
    days_since = datetime.strptime(days_since, "%d/%m/%Y")
    days_left = (datetime.now() - days_since).days
    
    demand = sold_quantity/days_left
    print(demand)
    return demand
    

def calculate_days_left(expiry_date_str):
    try:
        expiry_date = datetime.strptime(expiry_date_str, "%d/%m/%Y")
        days_left = (expiry_date - datetime.now()).days
        return max(days_left, 0)
    except ValueError:
        return 0
    
async def get_or_create_cart():
    cart = await cart_collection.find_one({"_id": "cart"})
    if not cart:
        new_cart = Cart()
        await cart_collection.insert_one(new_cart.model_dump())
        return new_cart
    return cart