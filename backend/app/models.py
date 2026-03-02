from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Task(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    employeeId: str
    employeeName: str = "" # Default to empty, we can fetch it or pass it
    title: str
    description: str = ""
    day: str
    viewType: str = "weekly"
    status: str = "in-progress"
    progress: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class User(BaseModel):
    id: str = Field(alias="_id") # employeeId or "admin"
    username: str
    password: str
    role: str
    name: str

class Token(BaseModel):
    token: str
    user: dict
