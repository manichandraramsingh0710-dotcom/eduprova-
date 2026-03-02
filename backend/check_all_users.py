import asyncio
from app.db import db
from app.auth import verify_password
import json
from bson import json_util

async def main():
    try:
        users = await db.users.find().to_list(100)
        for u in users:
            print(f"ID: {u.get('_id')}, USERNAME: {u.get('username')}, ROLE: {u.get('role')}, PASS MATCH 'pass': {verify_password('pass', u.get('password', ''))}")
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    asyncio.run(main())
