import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
DETECTIONS_DIR = BASE_DIR / "media" / "detections"

CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.3"))
SSD_CONFIDENCE_THRESHOLD = float(os.getenv("SSD_CONFIDENCE_THRESHOLD", "0.7"))
SSD_NMS_IOU_THRESHOLD = float(os.getenv("SSD_NMS_IOU_THRESHOLD", "0.7"))
COMPACT_SSD_CONFIDENCE_THRESHOLD = float(
    os.getenv("COMPACT_SSD_CONFIDENCE_THRESHOLD", str(CONFIDENCE_THRESHOLD))
)
COMPACT_SSD_NMS_IOU_THRESHOLD = float(os.getenv("COMPACT_SSD_NMS_IOU_THRESHOLD", "0.5"))
SKIP_FRAMES = int(os.getenv("SKIP_FRAMES", "5"))
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "yolov26_d1")
DRAW_DETECTION_OVERLAY = os.getenv("DRAW_DETECTION_OVERLAY", "true").lower() == "true"
OVERLAY_TTL_SECONDS = float(os.getenv("OVERLAY_TTL_SECONDS", "0.7"))
FILTER_TO_ALLOWED_CLASSES = (
    os.getenv("FILTER_TO_ALLOWED_CLASSES", "true").lower() == "true"
)

SSD_LABEL_MAP_D1_D2 = {
    1: "pistol",
    2: "rifle",
    3: "shotgun",
    4: "knife",
}

SSD_LABEL_MAP_D3 = {
    1: "weapons",
    2: "unused_unverified_2",
    3: "unused_unverified_3",
    4: "unused_unverified_4",
}

COMPACT_SSD_LABEL_MAP_D1_D2 = {
    1: "pistol",
    2: "rifle",
    3: "shotgun",
}

COMPACT_SSD_LABEL_MAP_D3 = {
    1: "weapons",
    2: "unused_unverified_2",
    3: "unused_unverified_3",
}

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
    "ssd_resnet50_d1": {
        "name": "SSD ResNet50_d1",
        "path": str(MODELS_DIR / "SSD_RESNET50_d1.pth"),
        "type": "ssd_resnet50",
        "classes": ["pistol", "rifle", "shotgun", "knife"],
        "label_map": SSD_LABEL_MAP_D1_D2,
        "confidence_threshold": SSD_CONFIDENCE_THRESHOLD,
        "nms_iou_threshold": SSD_NMS_IOU_THRESHOLD,
    },
    "ssd_resnet50_d2": {
        "name": "SSD ResNet50_d2",
        "path": str(MODELS_DIR / "SSD_RESNET50_d2.pth"),
        "type": "ssd_resnet50",
        "classes": ["pistol", "rifle", "shotgun", "knife"],
        "label_map": SSD_LABEL_MAP_D1_D2,
        "confidence_threshold": SSD_CONFIDENCE_THRESHOLD,
        "nms_iou_threshold": SSD_NMS_IOU_THRESHOLD,
    },
    "ssd_resnet50_d3": {
        "name": "SSD ResNet50_d3",
        "path": str(MODELS_DIR / "SSD_RESNET50_d3.pth"),
        "type": "ssd_resnet50",
        "classes": ["weapons"],
        "label_map": SSD_LABEL_MAP_D3,
        "confidence_threshold": SSD_CONFIDENCE_THRESHOLD,
        "nms_iou_threshold": SSD_NMS_IOU_THRESHOLD,
    },
    "ssd_efficientnet_guns_1": {
        "name": "SSD EfficientNet-B0 Guns 1",
        "path": str(MODELS_DIR / "efficientnet_ssd_model_guns_1.pth"),
        "type": "ssd_efficientnet_b0",
        "classes": ["pistol", "rifle", "shotgun"],
        "label_map": COMPACT_SSD_LABEL_MAP_D1_D2,
        "confidence_threshold": COMPACT_SSD_CONFIDENCE_THRESHOLD,
        "nms_iou_threshold": COMPACT_SSD_NMS_IOU_THRESHOLD,
    },
    "ssd_efficientnet_guns_2": {
        "name": "SSD EfficientNet-B0 Guns 2",
        "path": str(MODELS_DIR / "efficientnet_ssd_model_guns_2.pth"),
        "type": "ssd_efficientnet_b0",
        "classes": ["pistol", "rifle", "shotgun"],
        "label_map": COMPACT_SSD_LABEL_MAP_D1_D2,
        "confidence_threshold": COMPACT_SSD_CONFIDENCE_THRESHOLD,
        "nms_iou_threshold": COMPACT_SSD_NMS_IOU_THRESHOLD,
    },
    "ssd_efficientnet_knives": {
        "name": "SSD EfficientNet-B0 Knives",
        "path": str(MODELS_DIR / "efficientnet_ssd_model_knives.pth"),
        "type": "ssd_efficientnet_b0",
        "classes": ["weapons"],
        "label_map": COMPACT_SSD_LABEL_MAP_D3,
        "confidence_threshold": COMPACT_SSD_CONFIDENCE_THRESHOLD,
        "nms_iou_threshold": COMPACT_SSD_NMS_IOU_THRESHOLD,
    },
    "ssd_mobilenet_guns_1": {
        "name": "SSD MobileNetV3-Large Guns 1",
        "path": str(MODELS_DIR / "mobilenet_ssd_model_guns_1.pth"),
        "type": "ssd_mobilenet_v3_large",
        "classes": ["pistol", "rifle", "shotgun"],
        "label_map": COMPACT_SSD_LABEL_MAP_D1_D2,
        "confidence_threshold": COMPACT_SSD_CONFIDENCE_THRESHOLD,
        "nms_iou_threshold": COMPACT_SSD_NMS_IOU_THRESHOLD,
    },
    "ssd_mobilenet_guns_2": {
        "name": "SSD MobileNetV3-Large Guns 2",
        "path": str(MODELS_DIR / "mobilenet_ssd_model_guns_2.pth"),
        "type": "ssd_mobilenet_v3_large",
        "classes": ["pistol", "rifle", "shotgun"],
        "label_map": COMPACT_SSD_LABEL_MAP_D1_D2,
        "confidence_threshold": COMPACT_SSD_CONFIDENCE_THRESHOLD,
        "nms_iou_threshold": COMPACT_SSD_NMS_IOU_THRESHOLD,
    },
    "ssd_mobilenet_knives": {
        "name": "SSD MobileNetV3-Large Knives",
        "path": str(MODELS_DIR / "mobilenet_ssd_model_knives.pth"),
        "type": "ssd_mobilenet_v3_large",
        "classes": ["weapons"],
        "label_map": COMPACT_SSD_LABEL_MAP_D3,
        "confidence_threshold": COMPACT_SSD_CONFIDENCE_THRESHOLD,
        "nms_iou_threshold": COMPACT_SSD_NMS_IOU_THRESHOLD,
    },
}
