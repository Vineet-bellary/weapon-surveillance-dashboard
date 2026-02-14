import threading
import cv2
import time


class CameraWorker:

    def __init__(self, camera_id: int, source):
        self.camera_id = camera_id
        self.source = source
        self.cap = None
        self.running = False
        self.frame = None
        self.thread = None
        self.status = "INITIALIZING"
        self.last_seen = None

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
                self.frame = frame
                self.last_seen = time.time()
                self.status = "ONLINE"
            else:
                self.status = "OFFLINE"

                # Release broken capture
                if self.cap:
                    self.cap.release()
                    self.cap = None

                time.sleep(2)

            time.sleep(0.03)

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
    def __init__(self):
        self.workers = {}

    def start_camera(self, camera_id: int, source):
        if camera_id not in self.workers:
            worker = CameraWorker(camera_id, source)
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
