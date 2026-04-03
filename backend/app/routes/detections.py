from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.post("/detections", response_model=schemas.DetectionResponse)
def create_detection(
    detection: schemas.DetectionCreate,
    request: Request,
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
        image_path=detection.image_path,
        model_name="manual",
    )

    db.add(db_detection)
    db.commit()
    db.refresh(db_detection)

    request.app.state.alert_service.push_alert(
        camera_id=db_detection.camera_id,
        object_class=db_detection.object_class,
        confidence=db_detection.confidence,
        image_path=db_detection.image_path,
    )

    return db_detection

@router.get("/detections", response_model=List[schemas.DetectionResponse])
def get_detections(
    camera_id: int | None = None,
    object_class: str | None = None,
    min_confidence: float | None = None,
    limit: int = 200,
    db: Session = Depends(get_db)
):
    if camera_id is not None:
        camera = db.query(models.Camera).filter(models.Camera.id == camera_id).first()

        if camera is None:
            raise HTTPException(status_code=404, detail="Camera not found")

    query = db.query(models.Detection)

    if camera_id is not None:
        query = query.filter(models.Detection.camera_id == camera_id)

    if object_class is not None:
        query = query.filter(models.Detection.object_class == object_class.lower())

    if min_confidence is not None:
        query = query.filter(models.Detection.confidence >= min_confidence)

    limit = max(1, min(limit, 1000))

    return (
        query.order_by(models.Detection.detected_at.desc())
        .limit(limit)
        .all()
    )


@router.delete("/detections/{detection_id}")
def delete_detection(
    detection_id: int,
    db: Session = Depends(get_db),
):
    detection = (
        db.query(models.Detection)
        .filter(models.Detection.id == detection_id)
        .first()
    )

    if detection is None:
        raise HTTPException(status_code=404, detail="Detection not found")

    db.delete(detection)
    db.commit()

    return {"message": "Detection deleted", "deleted": 1}


@router.delete("/detections")
def clear_detections(
    camera_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Detection)

    if camera_id is not None:
        camera = db.query(models.Camera).filter(models.Camera.id == camera_id).first()
        if camera is None:
            raise HTTPException(status_code=404, detail="Camera not found")
        query = query.filter(models.Detection.camera_id == camera_id)

    deleted = query.delete(synchronize_session=False)
    db.commit()

    return {"message": "Detection logs cleared", "deleted": deleted}
