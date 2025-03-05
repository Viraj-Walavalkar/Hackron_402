from pydantic import BaseModel
from bson import ObjectId

class InventoryItem(BaseModel):
    id: str
    name: str
    quantity: int
    price: float

    class Config:
        # Convert MongoDB ObjectId to string when serializing to JSON
        json_encoders = {
            ObjectId: str
        }

class InventoryItemCreate(BaseModel):
    name: str
    quantity: int
    price: float

class InventoryItemUpdate(BaseModel):
    name: str
    quantity: int
    price: float
