import threading
from collections import deque
from datetime import datetime, timezone


class AlertService:
    def __init__(self, max_alerts: int = 100):
        self._lock = threading.Lock()
        self._alerts = deque(maxlen=max_alerts)
        self._next_id = 1

    def push_alert(self, camera_id: int, object_class: str, confidence: float, image_path: str | None):
        with self._lock:
            alert = {
                "id": self._next_id,
                "camera_id": camera_id,
                "object_class": object_class,
                "confidence": confidence,
                "image_path": image_path,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            self._next_id += 1
            self._alerts.appendleft(alert)
            return alert

    def get_alerts(self, limit: int = 20):
        with self._lock:
            return list(self._alerts)[:limit]

    def dismiss_alert(self, alert_id: int):
        with self._lock:
            remaining = [a for a in self._alerts if a["id"] != alert_id]
            if len(remaining) == len(self._alerts):
                return False
            self._alerts = deque(remaining, maxlen=self._alerts.maxlen)
            return True
