import asyncio
from app.db import db
async def main():
    async for u in db.users.find({}):
        print(f"User ID: {u['_id']}, PassHash: {u['password'][:10]}, Role: {u['role']}")

if __name__ == "__main__":
    asyncio.run(main())
