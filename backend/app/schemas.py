from pydantic import BaseModel
from datetime import datetime

"""
    This module deals with API validation.
"""


class CameraCreate(BaseModel):
    name: str
    stream_url: str
    is_active: bool = True  # default active


class CameraResponse(BaseModel):
    id: int
    name: str
    stream_url: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CameraUpdate(BaseModel):
    name: str | None = None
    stream_url: str | None = None
    is_active: bool | None = None


class DetectionCreate(BaseModel):
    camera_id: int
    object_class: str
    confidence: float


class DetectionResponse(BaseModel):
    id: int
    camera_id: int
    object_class: str
    confidence: float
    image_path: str | None
    detected_at: datetime

    class Config:
        from_attributes = True
