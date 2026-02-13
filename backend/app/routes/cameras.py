from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter()


@router.post("/cameras", response_model=schemas.CameraResponse)
def create_camera(camera: schemas.CameraCreate, db: Session = Depends(get_db)):
    db_camera = models.Camera(name=camera.name, stream_url=camera.stream_url)
    db.add(db_camera)
    db.commit()
    db.refresh(db_camera)

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
