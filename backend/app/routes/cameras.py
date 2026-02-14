from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import cv2
import time

from .. import models, schemas
from ..database import get_db

router = APIRouter()


@router.post("/cameras", response_model=schemas.CameraResponse)
def create_camera(
    camera: schemas.CameraCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    db_camera = models.Camera(
        name=camera.name,
        stream_url=camera.stream_url,
        is_active=camera.is_active,
    )

    db.add(db_camera)
    db.commit()
    db.refresh(db_camera)

    if db_camera.is_active:
        manager = request.app.state.camera_manager

        # For now dev mapping
        source = db_camera.stream_url
        if source.isdigit():
            source = int(source)
        manager.start_camera(db_camera.id, source)

    return db_camera


@router.get("/cameras", response_model=List[schemas.CameraResponse])
def get_cameras(db: Session = Depends(get_db)):
    cameras = db.query(models.Camera).all()

    return cameras


@router.get("/cameras/{camera_id}", response_model=schemas.CameraResponse)
def get_camera(camera_id: int, db: Session = Depends(get_db)):
    camera = db.query(models.Camera).filter(models.Camera.id == camera_id).first()

    if camera is None:
        raise HTTPException(status_code=404, detail="Camera not found")

    return camera


@router.get("/stream/{camera_id}")
def stream_camera(camera_id: int, request: Request):

    manager = request.app.state.camera_manager
    worker = manager.get_worker(camera_id)

    if not worker:
        raise HTTPException(status_code=404, detail="Camera not running")

    def generate():
        try:
            while worker.running:
                frame = worker.get_frame()
                if frame is None:
                    time.sleep(0.03)
                    continue

                ret, buffer = cv2.imencode(".jpg", frame)
                if not ret:
                    continue

                frame_bytes = buffer.tobytes()

                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
                )
        except:
            print("Stream closed")

    return StreamingResponse(
        generate(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@router.get("/camera-health")
def get_camera_health(request: Request):
    manager = request.app.state.camera_manager

    health_data = []

    for worker in manager.workers.values():
        health_data.append(worker.get_status())

    return health_data


@router.put("/cameras/{camera_id}", response_model=schemas.CameraResponse)
def update_camera(
    camera_id: int,
    camera_update: schemas.CameraUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    db_camera = db.query(models.Camera).filter(models.Camera.id == camera_id).first()

    if not db_camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    # Track old active state
    old_active_state = db_camera.is_active

    # Update fields dynamically
    if camera_update.name is not None:
        db_camera.name = camera_update.name

    if camera_update.stream_url is not None:
        db_camera.stream_url = camera_update.stream_url

    if camera_update.is_active is not None:
        db_camera.is_active = camera_update.is_active

    db.commit()
    db.refresh(db_camera)

    # 🔥 Runtime control
    manager = request.app.state.camera_manager

    # If activated
    if old_active_state is False and db_camera.is_active is True:
        source = db_camera.stream_url
        if source.isdigit():
            source = int(source)

        manager.start_camera(db_camera.id, source)

    # If deactivated
    if old_active_state is True and db_camera.is_active is False:
        manager.stop_camera(db_camera.id)

    return db_camera
