from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy import text

from .database import engine, Base
from . import models
from .routes import cameras, detections, models as model_routes, alerts
from .utils.camera_manager import CameraManager
from .utils.model_manager import ModelManager
from .utils.alert_service import AlertService


@asynccontextmanager
async def lifespan(app: FastAPI):
    from .database import SessionLocal
    from . import models

    app.state.model_manager = ModelManager()
    app.state.alert_service = AlertService()
    app.state.camera_manager = CameraManager(
        model_manager=app.state.model_manager,
        alert_service=app.state.alert_service,
    )

    db = SessionLocal()

    try:
        active_cameras = (
            db.query(models.Camera).filter(models.Camera.is_active == True).all()
        )

        for camera in active_cameras:
            source = camera.stream_url  # DEV ONLY: hardcoded camera index mapping
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

# Sqlite Database building
Base.metadata.create_all(bind=engine)


def ensure_detection_columns():
    with engine.connect() as conn:
        result = conn.execute(text("PRAGMA table_info(detections)"))
        existing_columns = {row[1] for row in result}
        if "model_name" not in existing_columns:
            conn.execute(text("ALTER TABLE detections ADD COLUMN model_name VARCHAR"))
            conn.commit()


ensure_detection_columns()

# Routes
app.include_router(cameras.router)
app.include_router(detections.router)
app.include_router(model_routes.router)
app.include_router(alerts.router)


# Endpoints
@app.get("/")
def home():
    return {"message": "Backend running mama"}
