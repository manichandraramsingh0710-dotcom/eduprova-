import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
sys.path.append('.')
from app.auth import get_password_hash

async def run():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.eduprova
    new_hash = get_password_hash('admin')
    result = await db.users.update_one({'username': 'admin'}, {'$set': {'password': new_hash}})
    print(f'Password updated to admin. Modified: {result.modified_count}')

asyncio.run(run())
