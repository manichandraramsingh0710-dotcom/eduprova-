import asyncio
from app.db import db
from bson import json_util

async def print_tasks():
    tasks = await db.tasks.find({"employeeId": "E001"}).to_list(100)
    print("Tasks for E001:", len(tasks))

if __name__ == "__main__":
    asyncio.run(print_tasks())
