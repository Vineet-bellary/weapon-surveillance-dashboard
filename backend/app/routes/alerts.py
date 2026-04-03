from fastapi import APIRouter, HTTPException, Request

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("")
def get_alerts(request: Request, limit: int = 20):
    service = request.app.state.alert_service
    limit = max(1, min(limit, 100))
    return service.get_alerts(limit=limit)


@router.delete("/{alert_id}")
def dismiss_alert(alert_id: int, request: Request):
    service = request.app.state.alert_service
    deleted = service.dismiss_alert(alert_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert dismissed"}
