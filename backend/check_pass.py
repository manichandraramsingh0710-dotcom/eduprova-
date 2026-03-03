import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
sys.path.append('.')
from app.auth import verify_password, pwd_context
from passlib.exc import UnknownHashError

async def run():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.eduprova
    user = await db.users.find_one({'username': '2026999'})
    if not user:
         print("User not found.")
         return
    print(f"User hash: {user['password']}")
    try:
         print(f"pwd_context scheme: {pwd_context.identify(user['password'])}")
    except Exception as e:
         print("Failed to identify scheme", e)
    
    passwords_to_try = ['2026999', 'password', 'pass', '123456']
    for p in passwords_to_try:
        try:
             res = verify_password(p, user['password'])
             print(f"Try {p}: {res}")
        except Exception as e:
             print(f"Error for {p}: {e}")

asyncio.run(run())
