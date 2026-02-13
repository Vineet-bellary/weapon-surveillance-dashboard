from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.post("/detections", response_model=schemas.DetectionResponse)
def create_detection(
    detection: schemas.DetectionCreate,
    db: Session = Depends(get_db)
):
    # Camera exisit?
    camera = (
        db.query(models.Camera).filter(models.Camera.id == detection.camera_id).first()
    )
    if camera is None:
        raise HTTPException(status_code=404, detail="Camera not found")

    # Detection record
    db_detection = models.Detection(
        camera_id=detection.camera_id,
        object_class=detection.object_class,
        confidence=detection.confidence,
        image_path=None,  # For now, we are not saving screenshots
    )

    db.add(db_detection)
    db.commit()
    db.refresh(db_detection)

    return db_detection

@router.get("/detections", response_model=List[schemas.DetectionResponse])
def get_detections(
    camera_id: int | None = None,
    db: Session = Depends(get_db)
):
    if camera_id is not None:
        camera = db.query(models.Camera).filter(models.Camera.id == camera_id).first()

        if camera is None:
            raise HTTPException(status_code=404, detail="Camera not found")

        detections = (
            db.query(models.Detection)
            .filter(models.Detection.camera_id == camera_id)
            .all()
        )

        return detections

    # If no camera_id → return all
    return db.query(models.Detection).all()
