import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
DETECTIONS_DIR = BASE_DIR / "media" / "detections"

CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.3"))
SKIP_FRAMES = int(os.getenv("SKIP_FRAMES", "5"))
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "yolov26_d1")
DRAW_DETECTION_OVERLAY = os.getenv("DRAW_DETECTION_OVERLAY", "true").lower() == "true"
OVERLAY_TTL_SECONDS = float(os.getenv("OVERLAY_TTL_SECONDS", "0.7"))
FILTER_TO_ALLOWED_CLASSES = (
    os.getenv("FILTER_TO_ALLOWED_CLASSES", "true").lower() == "true"
)

# The values under classes should match your trained model labels.
MODELS_REGISTRY = {
    "yolov11_d1": {
        "name": "YOLOv11_d1",
        "path": str(MODELS_DIR / "YOLOv11_d1.pt"),
        "type": "ultralytics",
        "classes": ["pistol", "rifle", "shotgun", "knife"],
    },
    "yolov12_d1": {
        "name": "YOLOv12_d1",
        "path": str(MODELS_DIR / "YOLOv12_d1.pt"),
        "type": "ultralytics",
        "classes": ["pistol", "rifle", "shotgun", "knife"],
    },
    "yolov26_d1": {
        "name": "YOLOv26_d1",
        "path": str(MODELS_DIR / "YOLOv26_d1.pt"),
        "type": "ultralytics",
        "classes": ["pistol", "rifle", "shotgun", "knife"],
    },
    "yolov11_d2": {
        "name": "YOLOv11_d2",
        "path": str(MODELS_DIR / "YOLOv11_d2.pt"),
        "type": "ultralytics",
        "classes": ["pistol", "rifle", "shotgun", "knife"],
    },
    "yolov12_d2": {
        "name": "YOLOv12_d2",
        "path": str(MODELS_DIR / "YOLOv12_d2.pt"),
        "type": "ultralytics",
        "classes": ["pistol", "rifle", "shotgun", "knife"],
    },
    "yolov26_d2": {
        "name": "YOLOv26_d2",
        "path": str(MODELS_DIR / "YOLOv26_d2.pt"),
        "type": "ultralytics",
        "classes": ["pistol", "rifle", "shotgun", "knife"],
    },
    "yolov11_d3": {
        "name": "YOLOv11_d3",
        "path": str(MODELS_DIR / "YOLOv11_d3.pt"),
        "type": "ultralytics",
        "classes": ["weapons"],
    },
    "yolov12_d3": {
        "name": "YOLOv12_d3",
        "path": str(MODELS_DIR / "YOLOv12_d3.pt"),
        "type": "ultralytics",
        "classes": ["weapons"],
    },
    "yolov26_d3": {
        "name": "YOLOv26_d3",
        "path": str(MODELS_DIR / "YOLOv26_d3.pt"),
        "type": "ultralytics",
        "classes": ["weapons"],
    },
}
