import motor.motor_asyncio

# MongoDB connection URI
MONGO_URI = "mongodb+srv://nishant:7359115406@hackron.vucoa.mongodb.net/?retryWrites=true&w=majority&appName=Hackron"  # Adjust this for your MongoDB setup
DATABASE_NAME = "inventory"

# MongoDB client setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]
products = db["products"]
cart_collection = db["cart"]

async def test_mongodb_connection():
    try:
        await client.server_info()  # This will raise an error if not connected
        print("✅ MongoDB is connected successfully!")
    except Exception as e:
        print(f"❌ MongoDB Connection Failed: {e}")
