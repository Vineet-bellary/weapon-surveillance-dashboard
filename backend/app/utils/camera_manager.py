import threading
import cv2
import time
import os
from datetime import datetime, timezone

from ..config import (
    DETECTIONS_DIR,
    SKIP_FRAMES,
    DRAW_DETECTION_OVERLAY,
    OVERLAY_TTL_SECONDS,
)
from ..database import SessionLocal
from .. import models


class CameraWorker:

    def __init__(self, camera_id: int, source, model_manager, alert_service):
        self.camera_id = camera_id
        self.source = source
        self.model_manager = model_manager
        self.alert_service = alert_service
        self.cap = None
        self.running = False
        self.frame = None
        self.thread = None
        self.status = "INITIALIZING"
        self.last_seen = None
        self.frame_counter = 0
        self.latest_detections = []
        self.latest_detection_at = 0.0

        os.makedirs(DETECTIONS_DIR, exist_ok=True)

    def start(self):
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self.update, daemon=True)
            self.thread.start()

    def update(self):
        while self.running:

            if self.cap is None or not self.cap.isOpened():
                self.cap = cv2.VideoCapture(
                    self.source  # , cv2.CAP_DSHOW
                )  # DEV ONLY: hardcoded camera index mapping

                if not self.cap.isOpened():
                    self.status = "OFFLINE"
                    time.sleep(2)
                    continue
                else:
                    self.status = "ONLINE"
                    self.last_seen = time.time()

            success, frame = self.cap.read()

            if success and frame is not None:
                self.last_seen = time.time()
                self.status = "ONLINE"
                self.frame_counter += 1

                if self.frame_counter % max(1, SKIP_FRAMES) == 0:
                    detections = self._run_detection(frame)
                    self.latest_detections = detections
                    self.latest_detection_at = time.time()

                if DRAW_DETECTION_OVERLAY:
                    overlay_detections = self._get_overlay_detections()
                    self.frame = self._draw_detections(frame, overlay_detections)
                else:
                    self.frame = frame
            else:
                self.status = "OFFLINE"

                # Release broken capture
                if self.cap:
                    self.cap.release()
                    self.cap = None

                time.sleep(2)

            time.sleep(0.03)

    def _run_detection(self, frame):
        active_model = self.model_manager.get_active_model()
        detections = self.model_manager.detect(frame)
        if not detections:
            return []

        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")
        image_name = f"camera_{self.camera_id}_{timestamp}.jpg"
        image_path = os.path.join(DETECTIONS_DIR, image_name)

        saved = cv2.imwrite(image_path, frame)
        relative_path = f"/media/detections/{image_name}" if saved else None

        db = SessionLocal()
        try:
            for det in detections:
                db_detection = models.Detection(
                    camera_id=self.camera_id,
                    object_class=det["object_class"],
                    confidence=det["confidence"],
                    image_path=relative_path,
                    model_name=active_model.key if active_model else None,
                )
                db.add(db_detection)

                self.alert_service.push_alert(
                    camera_id=self.camera_id,
                    object_class=det["object_class"],
                    confidence=det["confidence"],
                    image_path=relative_path,
                )

            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

        return detections

    def _get_overlay_detections(self):
        if not self.latest_detections:
            return []
        if (time.time() - self.latest_detection_at) > OVERLAY_TTL_SECONDS:
            return []
        return self.latest_detections

    def _draw_detections(self, frame, detections):
        if not detections:
            return frame

        display_frame = frame.copy()

        for det in detections:
            x1, y1, x2, y2 = [int(v) for v in det.get("bbox", [0, 0, 0, 0])]
            x1 = max(0, x1)
            y1 = max(0, y1)
            x2 = max(x1 + 1, x2)
            y2 = max(y1 + 1, y2)

            label = f"{det['object_class']} {det['confidence']:.2f}"
            color = (0, 0, 255)

            cv2.rectangle(display_frame, (x1, y1), (x2, y2), color, 2)

            (text_w, text_h), baseline = cv2.getTextSize(
                label,
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                2,
            )
            label_y = max(0, y1 - text_h - baseline - 6)
            cv2.rectangle(
                display_frame,
                (x1, label_y),
                (x1 + text_w + 8, label_y + text_h + baseline + 6),
                color,
                -1,
            )
            cv2.putText(
                display_frame,
                label,
                (x1 + 4, label_y + text_h + 1),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

        return display_frame

    def get_frame(self):
        return self.frame

    def get_status(self):
        return {
            "camera_id": self.camera_id,
            "status": self.status,
            "last_seen": self.last_seen,
        }

    def stop(self):
        self.running = False
        self.status = "STOPPED"
        if self.cap and self.cap.isOpened():
            self.cap.release()


class CameraManager:
    def __init__(self, model_manager, alert_service):
        self.workers = {}
        self.model_manager = model_manager
        self.alert_service = alert_service

    def start_camera(self, camera_id: int, source):
        if camera_id not in self.workers:
            worker = CameraWorker(
                camera_id,
                source,
                model_manager=self.model_manager,
                alert_service=self.alert_service,
            )
            worker.start()
            self.workers[camera_id] = worker

    def get_worker(self, camera_id: int):
        return self.workers.get(camera_id)

    def stop_camera(self, camera_id: int):
        worker = self.workers.get(camera_id)
        if worker:
            worker.stop()
            del self.workers[camera_id]

    def stop_all(self):
        for worker in self.workers.values():
            worker.stop()
            if worker.thread:
                worker.thread.join(timeout=1)
        self.workers.clear()
