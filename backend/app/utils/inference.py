import os
import importlib
from typing import Any

import cv2

from .ssd_compact import CompactSSDRuntime
from .ssd_resnet import SSDRuntime


class Detector:
    def __init__(
        self,
        model_path: str,
        model_type: str,
        allowed_classes: list[str],
        filter_to_allowed_classes: bool,
        label_map: dict[int, str] | None = None,
        confidence_threshold: float | None = None,
        nms_iou_threshold: float | None = None,
    ):
        self.model_path = model_path
        self.model_type = model_type
        self.allowed_classes = {c.lower() for c in allowed_classes}
        self.filter_to_allowed_classes = filter_to_allowed_classes
        self.label_map = label_map or {}
        self.confidence_threshold = confidence_threshold
        self.nms_iou_threshold = nms_iou_threshold or 0.7
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
        if not os.path.exists(self.model_path):
            self.error = f"Model file not found: {self.model_path}"
            return

        try:
            if self.model_type == "ultralytics":
                ultralytics = importlib.import_module("ultralytics")
                YOLO = getattr(ultralytics, "YOLO")
                self.model = YOLO(self.model_path)
            elif self.model_type == "ssd_resnet50":
                self.model = SSDRuntime.load(
                    model_path=self.model_path,
                    label_map=self.label_map,
                    nms_iou_threshold=self.nms_iou_threshold,
                )
            elif self.model_type in {"ssd_efficientnet_b0", "ssd_mobilenet_v3_large"}:
                self.model = CompactSSDRuntime.load(
                    model_path=self.model_path,
                    model_type=self.model_type,
                    label_map=self.label_map,
                    nms_iou_threshold=self.nms_iou_threshold,
                )
            else:
                self.error = f"Unsupported model type: {self.model_type}"
                return
            self.error = None
        except Exception as exc:
            self.error = str(exc)
            self.model = None

    def detect(self, frame: Any, confidence_threshold: float):
        if self.model is None:
            return []

        effective_threshold = self.confidence_threshold or confidence_threshold

        if self.model_type in {
            "ssd_resnet50",
            "ssd_efficientnet_b0",
            "ssd_mobilenet_v3_large",
        }:
            detections, debug = self.model.detect(frame, effective_threshold)
            self.last_debug = debug
            return self._filter_detections(detections)

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        try:
            results = self.model.predict(
                source=rgb, conf=effective_threshold, verbose=False
            )
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
            "raw_classes": [
                str(names.get(int(box.cls[0]), int(box.cls[0]))).lower()
                for box in boxes
            ],
            "filter_enabled": self.filter_to_allowed_classes,
        }

        return self._filter_detections(detections)

    def _filter_detections(self, detections: list[dict[str, Any]]):
        self.last_debug["filter_enabled"] = self.filter_to_allowed_classes

        if not self.filter_to_allowed_classes:
            return detections

        filtered = [
            detection
            for detection in detections
            if str(detection.get("object_class", "")).lower() in self.allowed_classes
        ]
        self.last_debug["filtered_count"] = len(filtered)
        return filtered
