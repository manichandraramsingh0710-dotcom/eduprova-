from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.auth import require_admin
from app.db import db

router = APIRouter(prefix="/api/employees", tags=["employees"])

@router.get("/")
async def get_employees(current_user: dict = Depends(require_admin)):
    cursor = db.users.find({"role": "employee"}).sort("createdAt", -1)
    employees = await cursor.to_list(length=100)
    return [
        {
            "id": emp["_id"],
            "name": emp["name"],
            "role": "employee",
            "createdAt": emp.get("createdAt")
        } for emp in employees
    ]

@router.get("/{employee_id}")
async def get_employee(employee_id: str, current_user: dict = Depends(require_admin)):
    emp = await db.users.find_one({"_id": employee_id, "role": "employee"})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"id": emp["_id"], "name": emp["name"], "role": "employee"}

from pydantic import BaseModel

class EmployeeUpdate(BaseModel):
    name: str

@router.put("/{employee_id}")
async def update_employee(employee_id: str, payload: EmployeeUpdate, current_user: dict = Depends(require_admin)):
    result = await db.users.update_one(
        {"_id": employee_id, "role": "employee"},
        {"$set": {"name": payload.name}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    await db.tasks.update_many(
        {"employeeId": employee_id},
        {"$set": {"employeeName": payload.name}}
    )
    return {"message": "Employee updated successfully"}

@router.delete("/{employee_id}")
async def delete_employee(employee_id: str, current_user: dict = Depends(require_admin)):
    result = await db.users.delete_one({"_id": employee_id, "role": "employee"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    await db.tasks.delete_many({"employeeId": employee_id})
    return {"message": "Employee and their tasks deleted successfully"}
