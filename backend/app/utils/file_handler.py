import os
import uuid
from dotenv import load_dotenv
from datetime import datetime
import cv2

load_dotenv()

MEDIA_ROOT = os.getenv("MEDIA_ROOT", "media")
DETECTIONS_FOLDER = os.getenv("DETECTIONS_FOLDER", "detections")

def save_detection_image(frame, camera_id: int) -> str:
    """
    Saves a detection frame to media/detections/
    Returns relative path to store in DB.
    """

    # Generate unique filename
    unique_id = uuid.uuid4().hex
    filename = f"cam{camera_id}_{unique_id}.jpg"

    # Build directory path
    base_dir = os.path.join(MEDIA_ROOT, DETECTIONS_FOLDER)
    os.makedirs(base_dir, exist_ok=True)

    # Full file path
    file_path = os.path.join(base_dir, filename)

    # Save image
    cv2.imwrite(file_path, frame)

    # Return relative path (for DB storage)
    return f"detections/{filename}"
