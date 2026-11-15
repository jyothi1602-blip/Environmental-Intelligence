from pydantic import BaseModel
from typing import List, Optional

class AlertItem(BaseModel):
    id: str
    title: str
    severity: str  # "info", "warning", "danger", "critical"
    severity_color: str
    category: str
    message: str
    action_advice: str
    affected_groups: List[str]
    timestamp: str

class AlertsResponse(BaseModel):
    user_id: Optional[int] = None
    sensitivity_group: str
    conditions_detected: List[str]
    aqi_level: int
    aqi_category: str
    alerts: List[AlertItem]
    total_alerts: int
    disclaimer: str = "This application provides informational air quality alerts only and does not provide medical diagnosis, clinical evaluation, or healthcare treatment recommendations."

