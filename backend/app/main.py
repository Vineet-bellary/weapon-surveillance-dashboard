from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from .database import engine, Base
from . import models
from .routes import cameras, detections
from .utils.camera_manager import CameraManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    from .database import SessionLocal
    from . import models

    # Create camera manager
    app.state.camera_manager = CameraManager()

    db = SessionLocal()

    try:
        active_cameras = (
            db.query(models.Camera).filter(models.Camera.is_active == True).all()
        )

        for camera in active_cameras:
            source = camera.id - 1  # DEV ONLY: hardcoded camera index mapping
            if isinstance(source, str) and source.isdigit():
                source = int(source)

            app.state.camera_manager.start_camera(camera.id, source)

    finally:
        db.close()

    yield  # app runs here

    # Shutdown logic (optional)
    app.state.camera_manager.stop_all()


app = FastAPI(lifespan=lifespan)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/media", StaticFiles(directory="media"), name="media")
app.state.camera_manager = CameraManager()

# Sqlite Database building
Base.metadata.create_all(bind=engine)

# Routes
app.include_router(cameras.router)
app.include_router(detections.router)


# Endpoints
@app.get("/")
def home():
    return {"message": "Backend running mama"}
