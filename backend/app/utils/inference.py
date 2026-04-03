import os
import importlib
from typing import Any

import cv2


class Detector:
    def __init__(
        self,
        model_path: str,
        model_type: str,
        allowed_classes: list[str],
        filter_to_allowed_classes: bool,
    ):
        self.model_path = model_path
        self.model_type = model_type
        self.allowed_classes = {c.lower() for c in allowed_classes}
        self.filter_to_allowed_classes = filter_to_allowed_classes
        self.model = None
        self.error = None
        self.last_debug = {
            "raw_count": 0,
            "filtered_count": 0,
            "raw_classes": [],
            "filter_enabled": self.filter_to_allowed_classes,
        }
        self._load()

    def _load(self):
        if self.model_type != "ultralytics":
            self.error = f"Unsupported model type: {self.model_type}"
            return

        if not os.path.exists(self.model_path):
            self.error = f"Model file not found: {self.model_path}"
            return

        try:
            ultralytics = importlib.import_module("ultralytics")
            YOLO = getattr(ultralytics, "YOLO")
            self.model = YOLO(self.model_path)
            self.error = None
        except Exception as exc:
            self.error = str(exc)
            self.model = None

    def detect(self, frame: Any, confidence_threshold: float):
        if self.model is None:
            return []

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        try:
            results = self.model.predict(source=rgb, conf=confidence_threshold, verbose=False)
        except Exception:
            return []

        detections = []
        if not results:
            return detections

        result = results[0]
        names = getattr(result, "names", {})
        boxes = getattr(result, "boxes", None)

        if boxes is None:
            return detections

        for box in boxes:
            cls_idx = int(box.cls[0])
            class_name = str(names.get(cls_idx, cls_idx)).lower()
            if (
                self.filter_to_allowed_classes
                and class_name not in self.allowed_classes
            ):
                continue

            conf = float(box.conf[0])
            xyxy = box.xyxy[0].tolist()
            detections.append(
                {
                    "object_class": class_name,
                    "confidence": conf,
                    "bbox": [float(v) for v in xyxy],
                }
            )

        self.last_debug = {
            "raw_count": len(boxes),
            "filtered_count": len(detections),
            "raw_classes": [str(names.get(int(box.cls[0]), int(box.cls[0]))).lower() for box in boxes],
            "filter_enabled": self.filter_to_allowed_classes,
        }

        return detections
