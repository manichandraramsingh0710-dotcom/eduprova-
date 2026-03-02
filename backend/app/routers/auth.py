from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.auth import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_password_hash
from app.db import db
from datetime import timedelta

class LoginRequest(BaseModel):
    username: str
    password: str

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login")
async def login(req: LoginRequest):
    user = await db.users.find_one({"username": req.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    if not verify_password(req.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["_id"], "role": user["role"]}, expires_delta=access_token_expires
    )
    
    return {
        "token": access_token, 
        "user": {
            "role": user["role"],
            "employeeId": user["_id"] if user["role"] == "employee" else "admin",
            "name": user.get("name", "")
        }
    }

def seed_db():
    import asyncio
    async def run_seed():
        admin = await db.users.find_one({"_id": "admin"})
        if not admin:
            await db.users.insert_many([
                {"_id": "admin", "username": "admin", "password": get_password_hash("admin"), "role": "admin", "name": "Ruksana"}
            ])
            print("Database seeded with initial users.")
            
        employee = await db.users.find_one({"_id": "E001"})
        if not employee:
            from datetime import datetime
            await db.users.insert_one({
                "_id": "E001",
                "username": "E001",
                "password": get_password_hash("pass"),
                "role": "employee",
                "name": "Jane Doe",
                "createdAt": datetime.utcnow()
            })
            print("Database seeded with initial employee E001.")
    asyncio.create_task(run_seed())

@router.on_event("startup")
async def startup_event():
    seed_db()
