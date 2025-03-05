from bson import ObjectId
from fastapi import HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from database import products

class Subscription(BaseModel):
    endpoint: str
    keys: dict

class CartItem(BaseModel):
    product_id: str  
    quantity: int    



class Cart(BaseModel):
    _id: str = "cart"  
    items: List[CartItem] = [] 
    total_price: Optional[float] = 0.0  
    
    async def calculate_total_price(self):
        self.total_price = 0.0
        for item in self.items:
            product = await products.find_one({"_id": ObjectId(item.product_id)})
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            self.total_price += item.quantity * product["price"]
            
class discountResponse:
    product_id : str
    name : str
    price : int
    quantity : int
    discount : float
    
class GetCart:
    items : List[discountResponse] = []
    
    def __init__(self):
        self.items = []

            
class ProductCreateRequest(BaseModel):
    name: str  
    price: float
    quantity: int  
    expiry: str  
    description: str
    discount: float = 0.0
    listing_date: str
    category : str
    
class ProductResponse(BaseModel):
    id: str  
    name: str  
    price: float
    quantity: int  
    expiry: str  
    description: str
    discount: float = 0.0
    listing_date: str 
    category: str
    
class BuyRequest(BaseModel):
    id: str
    quantity: int


from typing import Optional

class InventoryItemCreate(BaseModel):
    product_id: str = Field(..., example="abc123")
    quantity: int = Field(..., gt=0, example=10)
    location: Optional[str] = Field(None, example="Warehouse A")

class InventoryItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0, example=20)
    location: Optional[str] = Field(None, example="Warehouse B")

class ProductCreate(BaseModel):
    name: str = Field(..., example="Laptop")
    description: Optional[str] = Field(None, example="A high-end gaming laptop")
    price: float = Field(..., gt=0, example=999.99)
    stock: int = Field(..., ge=0, example=50)