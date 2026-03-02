import asyncio
from app.db import db
from app.auth import verify_password

async def main():
    users = await db.users.find().to_list(100)
    for u in users:
        print(u['_id'], u['password'][:10], u.get('role'), u.get('username'))

if __name__ == "__main__":
    asyncio.run(main())
