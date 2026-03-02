import asyncio
from app.db import db
from bson import json_util

async def print_tasks():
    tasks = await db.tasks.find().to_list(100)
    for t in tasks:
        print("Task:", t.get("title"), "EmployeeId:", t.get("employeeId"))

if __name__ == "__main__":
    asyncio.run(print_tasks())
