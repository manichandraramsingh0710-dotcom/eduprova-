from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from app.auth import get_current_user, require_admin
from app.db import db
from app.models import Task
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

def serialize_doc(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.post("/")
async def create_task(task: Task, current_user: dict = Depends(require_admin)):
    from app.auth import get_password_hash
    
    emp = await db.users.find_one({"_id": task.employeeId, "role": "employee"})
    employee_created = False
    
    if not emp:
        if not task.employeeName:
            raise HTTPException(status_code=400, detail="Employee Name is required for new employees")
        
        # Auto-create the user if they don't exist
        await db.users.insert_one({
             "_id": task.employeeId,
             "username": task.employeeId,
             "password": get_password_hash("pass"),
             "role": "employee",
             "name": task.employeeName,
             "createdAt": datetime.utcnow()
        })
        employee_created = True
    else:
        # If employeeId exists but name is empty, keep old name
        task.employeeName = task.employeeName or emp.get("name", "")
        
    task_dict = task.dict(by_alias=True, exclude_none=True)
    if "progress" not in task_dict or task_dict["progress"] == 0:
        task_dict["progress"] = 100 if task_dict.get("status") == "completed" else 0
        
    if "_id" in task_dict and task_dict["_id"] is None:
        del task_dict["_id"]
        
    task_dict["createdAt"] = datetime.utcnow()
    result = await db.tasks.insert_one(task_dict)
    
    saved_task = await db.tasks.find_one({"_id": result.inserted_id})
    res = serialize_doc(saved_task)
    res["employeeCreated"] = employee_created
    return res

@router.get("/")
async def get_all_tasks(
    day: Optional[str] = None, 
    employeeId: Optional[str] = None, 
    current_user: dict = Depends(require_admin)
):
    query = {}
    if day:
        query["day"] = day
    if employeeId:
        query["employeeId"] = employeeId
        
    cursor = db.tasks.find(query).sort("createdAt", -1)
    tasks = await cursor.to_list(length=1000)
    return [serialize_doc(task) for task in tasks]

@router.get("/me")
async def get_my_tasks(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "employee":
        raise HTTPException(status_code=403, detail="Only employees can access this route")
        
    cursor = db.tasks.find({"employeeId": current_user["userId"]})
    tasks = await cursor.to_list(length=1000)
    return [serialize_doc(task) for task in tasks]

from pydantic import BaseModel
class StatusUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = None

@router.put("/{task_id}/status")
async def update_task_status(task_id: str, payload: StatusUpdate, current_user: dict = Depends(get_current_user)):
    try:
        task_obj_id = ObjectId(task_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
        
    task = await db.tasks.find_one({"_id": task_obj_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if current_user["role"] == "employee" and task["employeeId"] != current_user["userId"]:
        raise HTTPException(status_code=403, detail="Not permitted to update this task")

    updates = {}
    if payload.status:
        if payload.status not in ["completed", "in-progress"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        updates["status"] = payload.status
        updates["progress"] = 100 if payload.status == "completed" else (task.get("progress", 0) if task.get("progress", 0) < 100 else 50)
    
    if payload.progress is not None:
        if not (0 <= payload.progress <= 100):
            raise HTTPException(status_code=400, detail="Progress must be between 0 and 100")
        updates["progress"] = payload.progress
        updates["status"] = "completed" if payload.progress == 100 else "in-progress"

    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
        
    await db.tasks.update_one(
        {"_id": task_obj_id}, 
        {"$set": updates}
    )
    
    updated_task = await db.tasks.find_one({"_id": task_obj_id})
    return serialize_doc(updated_task)

@router.put("/{task_id}")
async def edit_task(task_id: str, updates: dict, current_user: dict = Depends(require_admin)):
    try:
        task_obj_id = ObjectId(task_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    
    task = await db.tasks.find_one({"_id": task_obj_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    safe_updates = {k: v for k, v in updates.items() if k in ["title", "description", "day", "viewType"]}
    if safe_updates:
        await db.tasks.update_one({"_id": task_obj_id}, {"$set": safe_updates})
        
    updated_task = await db.tasks.find_one({"_id": task_obj_id})
    return serialize_doc(updated_task)

@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(require_admin)):
    try:
        task_obj_id = ObjectId(task_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
        
    res = await db.tasks.delete_one({"_id": task_obj_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
        
    return {"message": "Task deleted successfully"}

