from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import auth, tasks, employees

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Log and seed DB on startup
    print("Starting up and seeding database...")
    await auth.seed_db()
    yield
    print("Shutting down...")

app = FastAPI(title="Eduprova API", lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(employees.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Eduprova API"}
