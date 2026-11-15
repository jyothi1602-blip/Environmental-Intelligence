import logging
from typing import Optional
from fastapi import APIRouter, Query, Depends
from app.config import settings
from app.models.alert import AlertsResponse
from app.services.aqi_service import get_current_aqi
from app.services.alert_service import generate_personalized_alerts
from app.routes.auth import get_current_user_id
from app.db.sqlite import get_health_profile

logger = logging.getLogger("routes.alerts")
router = APIRouter(prefix="/api/alerts", tags=["Personalized Pollution Alerts"])

@router.get("/personalized", response_model=AlertsResponse)
async def personalized_alerts(
    latitude: Optional[float] = Query(None, ge=-90.0, le=90.0),
    longitude: Optional[float] = Query(None, ge=-180.0, le=180.0),
    city: str = Query("Delhi"),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    lat = latitude if latitude is not None else settings.DEFAULT_LATITUDE
    lon = longitude if longitude is not None else settings.DEFAULT_LONGITUDE

    aqi_data = await get_current_aqi(lat, lon, city)
    
    # Retrieve user's health profile if authenticated
    conditions = []
    sensitivity_group = "General"
    if user_id:
        profile = get_health_profile(user_id)
        if profile and profile.get("consent_given"):
            conditions = profile.get("conditions", [])
            sensitivity_group = profile.get("sensitivity_group", "General")

    return generate_personalized_alerts(
        aqi_data=aqi_data,
        sensitivity_group=sensitivity_group,
        conditions=conditions,
        user_id=user_id
    )
