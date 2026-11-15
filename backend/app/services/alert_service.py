import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from app.models.alert import AlertItem, AlertsResponse
from app.models.environmental import AQIResponse

def generate_personalized_alerts(
    aqi_data: AQIResponse,
    sensitivity_group: str = "General",
    conditions: Optional[List[str]] = None,
    user_id: Optional[int] = None
) -> AlertsResponse:
    now_iso = datetime.now(timezone.utc).isoformat()
    conditions = conditions or []
    alerts: List[AlertItem] = []

    aqi = aqi_data.aqi
    pm25 = aqi_data.pollutants.get("pm25")
    pm10 = aqi_data.pollutants.get("pm10")
    o3 = aqi_data.pollutants.get("o3")
    
    is_sensitive_profile = (
        sensitivity_group in ["Children", "Elderly", "Sensitive individuals"] or
        any(c in ["Asthma", "Respiratory sensitivity", "Allergies"] for c in conditions)
    )

    # 1. AQI Category Alert
    if aqi > 200:
        alerts.append(AlertItem(
            id=str(uuid.uuid4())[:8],
            title="Severe Pollution Health Alert",
            severity="danger",
            severity_color="#EF4444",
            category="AQI Status",
            message=f"Current AQI is {aqi} ({aqi_data.category}). General public and vulnerable groups are exposed to severe atmospheric pollutants.",
            action_advice="Avoid non-essential outdoor travel and keep air purifiers active indoors.",
            affected_groups=["All Population Groups", "Sensitive Individuals", "Children", "Elderly"],
            timestamp=now_iso
        ))
    elif aqi > 100:
        severity = "warning" if not is_sensitive_profile else "danger"
        alerts.append(AlertItem(
            id=str(uuid.uuid4())[:8],
            title="Elevated AQI: Sensitive Group Advisory",
            severity=severity,
            severity_color="#F97316" if severity == "warning" else "#EF4444",
            category="AQI Status",
            message=f"Current AQI is {aqi} ({aqi_data.category}). Members of sensitive groups may experience minor to moderate respiratory irritation.",
            action_advice="Reduce strenuous outdoor aerobic activities during peak daylight hours.",
            affected_groups=["Sensitive Individuals", "Asthma Patients", "Children", "Elderly"],
            timestamp=now_iso
        ))
    elif aqi > 50:
        alerts.append(AlertItem(
            id=str(uuid.uuid4())[:8],
            title="Moderate Ambient Air Quality",
            severity="info",
            severity_color="#F59E0B",
            category="AQI Status",
            message=f"Current AQI is {aqi} ({aqi_data.category}). Air quality is acceptable; unusually sensitive individuals may notice slight sensitivity.",
            action_advice="Unusually sensitive people should monitor symptoms during prolonged outdoor exertion.",
            affected_groups=["Unusually Sensitive Individuals"],
            timestamp=now_iso
        ))
    else:
        alerts.append(AlertItem(
            id=str(uuid.uuid4())[:8],
            title="Satisfactory Air Quality",
            severity="info",
            severity_color="#10B981",
            category="AQI Status",
            message=f"Current AQI is {aqi} ({aqi_data.category}). Air quality poses little or no risk to health.",
            action_advice="Ideal conditions for outdoor mobility, commuting, and sports.",
            affected_groups=["General"],
            timestamp=now_iso
        ))

    # 2. PM2.5 Specific Alert
    if pm25 and pm25.concentration and pm25.concentration > 35.4:
        alerts.append(AlertItem(
            id=str(uuid.uuid4())[:8],
            title="Elevated Fine Particulate Matter (PM2.5)",
            severity="warning" if pm25.concentration < 55.4 else "danger",
            severity_color="#F97316" if pm25.concentration < 55.4 else "#EF4444",
            category="Pollutant Threshold",
            message=f"PM2.5 concentration is {pm25.concentration} µg/m³, exceeding the 24-hour baseline threshold.",
            action_advice="Consider wearing a high-efficiency particulate mask (such as N95) when commuting in high-traffic corridors.",
            affected_groups=["Asthma", "Cardiovascular Sensitivity", "Children"],
            timestamp=now_iso
        ))

    # 3. Personalized Health Sensitivities Alert
    if "Asthma" in conditions and aqi > 75:
        alerts.append(AlertItem(
            id=str(uuid.uuid4())[:8],
            title="Personalized Alert: Asthma Caution",
            severity="warning",
            severity_color="#F97316",
            category="Health Sensitivity",
            message="Because you indicated an asthma profile, elevated particulate readings may increase bronchial reactivity.",
            action_advice="Keep physician-prescribed reliever medication accessible and avoid heavily congested traffic roads.",
            affected_groups=["Asthma Sensitivity"],
            timestamp=now_iso
        ))

    if "Allergies" in conditions and o3 and o3.concentration and o3.concentration > 50:
        alerts.append(AlertItem(
            id=str(uuid.uuid4())[:8],
            title="Personalized Alert: Environmental Allergy Advisory",
            severity="info",
            severity_color="#3B82F6",
            category="Health Sensitivity",
            message="Ground-level oxidants combined with ambient particulates may aggravate airborne allergies and eye irritation.",
            action_advice="Rinse face after commuting and consider closed-ventilation commute options.",
            affected_groups=["Allergies"],
            timestamp=now_iso
        ))

    return AlertsResponse(
        user_id=user_id,
        sensitivity_group=sensitivity_group,
        conditions_detected=conditions,
        aqi_level=aqi,
        aqi_category=aqi_data.category,
        alerts=alerts,
        total_alerts=len(alerts)
    )

