from pydantic import BaseModel
from datetime import datetime

'''
    This module deals with API validation.
'''

class CameraCreate(BaseModel):
    name: str
    stream_url: str

class CameraResponse(BaseModel):
    id: int
    name: str
    stream_url: str
    is_active: bool
    created_at: datetime

    class config:
        from_attributes = True
