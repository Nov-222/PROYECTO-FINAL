from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None

db = MongoDB()

async def get_mongo_db():
    return db.client[settings.MONGO_DB]