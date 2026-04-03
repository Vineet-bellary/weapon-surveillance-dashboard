import threading
from dataclasses import dataclass

from ..config import (
    CONFIDENCE_THRESHOLD,
    DEFAULT_MODEL,
    MODELS_REGISTRY,
    FILTER_TO_ALLOWED_CLASSES,
)
from .inference import Detector


@dataclass
class ActiveModelInfo:
    key: str
    name: str
    path: str
    model_type: str
    classes: list[str]


class ModelManager:
    def __init__(self):
        self._lock = threading.Lock()
        self._active_key = ""
        self._detector: Detector | None = None
        self._error = None

        if DEFAULT_MODEL in MODELS_REGISTRY:
            self.switch_model(DEFAULT_MODEL)

    def list_models(self):
        models = []
        for key, meta in MODELS_REGISTRY.items():
            models.append(
                {
                    "key": key,
                    "name": meta["name"],
                    "path": meta["path"],
                    "type": meta["type"],
                    "classes": meta["classes"],
                    "is_active": key == self._active_key,
                }
            )
        return models

    def get_active_model(self):
        if not self._active_key:
            return None
        meta = MODELS_REGISTRY[self._active_key]
        return ActiveModelInfo(
            key=self._active_key,
            name=meta["name"],
            path=meta["path"],
            model_type=meta["type"],
            classes=meta["classes"],
        )

    def get_error(self):
        return self._error

    def switch_model(self, model_key: str):
        if model_key not in MODELS_REGISTRY:
            raise ValueError("Model does not exist")

        with self._lock:
            meta = MODELS_REGISTRY[model_key]
            detector = Detector(
                model_path=meta["path"],
                model_type=meta["type"],
                allowed_classes=meta["classes"],
                filter_to_allowed_classes=FILTER_TO_ALLOWED_CLASSES,
            )

            if detector.error:
                self._error = detector.error
            else:
                self._error = None

            self._detector = detector
            self._active_key = model_key

    def detect(self, frame):
        with self._lock:
            if self._detector is None:
                return []
            return self._detector.detect(frame, CONFIDENCE_THRESHOLD)

    def get_debug_info(self):
        with self._lock:
            active = self.get_active_model()
            return {
                "active_model": active.key if active else None,
                "error": self._error,
                "confidence_threshold": CONFIDENCE_THRESHOLD,
                "detector_debug": self._detector.last_debug if self._detector else None,
            }
