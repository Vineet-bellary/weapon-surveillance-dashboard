from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from . import models
from .routes import cameras, detections

app = FastAPI()

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sqlite Database building
Base.metadata.create_all(bind=engine)

# Routes
app.include_router(cameras.router)
app.include_router(detections.router)


# Endpoints
@app.get("/")
def home():
    return {"message": "Backend running mama"}
