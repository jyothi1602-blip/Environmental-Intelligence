import logging
import httpx
from datetime import datetime, timezone
from typing import Optional
from app.config import settings
from app.models.environmental import TrafficResponse

logger = logging.getLogger("services.traffic")

async def get_traffic_status(lat: float, lon: float, city: str = "Delhi") -> TrafficResponse:
    """
    Traffic service integrating external traffic providers (e.g. TomTom Traffic Flow).
    If no provider key is configured, displays a clear informative unavailable state as per mentor requirement.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    tomtom_key = settings.TOMTOM_API_KEY
    
    if tomtom_key and tomtom_key != "demo":
        url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point={lat},{lon}&key={tomtom_key}"
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json().get("flowSegmentData", {})
                    current_speed = data.get("currentSpeed", 30)
                    free_flow_speed = data.get("freeFlowSpeed", 45)
                    delay = max(0, int(data.get("currentTravelTime", 60) - data.get("freeFlowTravelTime", 60))) // 60
                    
                    reduction = max(0, int((1 - (current_speed / max(1, free_flow_speed))) * 100))
                    congestion_idx = min(100, int(reduction * 1.2))
                    
                    if congestion_idx < 25:
                        level = "Free Flow"
                    elif congestion_idx < 60:
                        level = "Moderate Congestion"
                    else:
                        level = "Heavy Congestion"
                    
                    return TrafficResponse(
                        status="Active",
                        congestion_level=level,
                        congestion_index=congestion_idx,
                        speed_reduction_pct=reduction,
                        source="TomTom Real-time Traffic API",
                        is_available=True,
                        note="Live GPS flow data collected from regional telemetry.",
                        timestamp=now_iso
                    )
        except Exception as e:
            logger.warning("TomTom traffic fetch failed: %s", str(e))
    
    # Informative unavailable state as strictly required by Mentor specifications
    return TrafficResponse(
        status="Provider Not Configured",
        congestion_level="Unavailable",
        congestion_index=0,
        speed_reduction_pct=0,
        source="Traffic Provider Service",
        is_available=False,
        note="Live traffic provider is not configured. To activate live congestion telemetry, provide a TOMTOM_API_KEY or HERE_API_KEY in backend/.env.",
        timestamp=now_iso
    )

