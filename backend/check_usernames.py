import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def run():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.eduprova
    users = await db.users.find().to_list(10)
    for u in users:
        print(f"ID: {u['_id']}, Username: {u.get('username')}, Role: {u.get('role')}")
asyncio.run(run())
