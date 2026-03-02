import asyncio
from app.db import db
from datetime import datetime
from app.auth import get_password_hash

async def setup():
    # 1. Clear db
    await db.users.delete_many({})
    await db.tasks.delete_many({})

    # 2. Add admin
    await db.users.insert_one({
        "_id": "admin", "username": "admin", "password": get_password_hash("admin"), "role": "admin", "name": "Admin"
    })

    # 3. Add employee
    await db.users.insert_one({
        "_id": "E001", "username": "E001", "password": get_password_hash("pass"), "role": "employee", "name": "Jane Doe"
    })

    # 4. Add task
    await db.tasks.insert_one({
        "employeeId": "E001",
        "employeeName": "Jane Doe",
        "title": "Fix Employee Dashboard bug",
        "description": "It should not show No Tasks Found when there are tasks",
        "day": "Mon",
        "status": "in-progress",
        "progress": 50,
        "createdAt": datetime.utcnow()
    })
    print("Database reset and seeded with exactly one employee task.")

if __name__ == "__main__":
    asyncio.run(setup())
