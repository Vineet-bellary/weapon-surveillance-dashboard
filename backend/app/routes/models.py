from fastapi import APIRouter, HTTPException, Request

router = APIRouter(prefix="/models", tags=["models"])


@router.get("")
def list_models(request: Request):
    manager = request.app.state.model_manager
    return {
        "models": manager.list_models(),
        "active_model": manager.get_active_model().key if manager.get_active_model() else None,
        "error": manager.get_error(),
    }


@router.post("/switch/{model_key}")
def switch_model(model_key: str, request: Request):
    manager = request.app.state.model_manager

    try:
        manager.switch_model(model_key)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    active = manager.get_active_model()
    return {
        "message": "Model switched",
        "active_model": active.key if active else None,
        "error": manager.get_error(),
    }


@router.get("/debug")
def model_debug(request: Request):
    manager = request.app.state.model_manager
    return manager.get_debug_info()


@router.post("/test/camera/{camera_id}")
def test_model_on_camera(camera_id: int, request: Request):
    camera_manager = request.app.state.camera_manager
    model_manager = request.app.state.model_manager

    worker = camera_manager.get_worker(camera_id)
    if worker is None:
        raise HTTPException(status_code=404, detail="Camera not running")

    frame = worker.get_frame()
    if frame is None:
        raise HTTPException(status_code=409, detail="Camera has no frame yet")

    detections = model_manager.detect(frame)
    return {
        "camera_id": camera_id,
        "detections_count": len(detections),
        "detections": detections,
        "debug": model_manager.get_debug_info(),
    }
