import asyncio
from app.db import db
from bson import json_util
from datetime import datetime

async def insert():
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
    print("Inserted task for E001")

if __name__ == "__main__":
    asyncio.run(insert())
