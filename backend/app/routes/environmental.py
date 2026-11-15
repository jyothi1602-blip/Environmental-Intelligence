import logging
from typing import Optional
from fastapi import APIRouter, Query
from app.config import settings
from app.models.environmental import (
    AQIResponse, WeatherResponse, TrafficResponse, EnvironmentalSummary,
    HistoricalResponse, HistoricalDataPoint
)
from app.services.aqi_service import get_current_aqi
from app.services.weather_service import get_current_weather
from app.services.traffic_service import get_traffic_status
from app.db.sqlite import get_historical_readings
from app.db.influx import query_historical_points, is_influx_connected

logger = logging.getLogger("routes.environmental")
router = APIRouter(prefix="/api/environmental", tags=["Environmental Intelligence"])

@router.get("/aqi", response_model=AQIResponse)
async def aqi_endpoint(
    latitude: Optional[float] = Query(None, ge=-90.0, le=90.0),
    longitude: Optional[float] = Query(None, ge=-180.0, le=180.0),
    city: str = Query("Delhi", description="City name")
):
    lat = latitude if latitude is not None else settings.DEFAULT_LATITUDE
    lon = longitude if longitude is not None else settings.DEFAULT_LONGITUDE
    return await get_current_aqi(lat, lon, city)

@router.get("/weather", response_model=WeatherResponse)
async def weather_endpoint(
    latitude: Optional[float] = Query(None, ge=-90.0, le=90.0),
    longitude: Optional[float] = Query(None, ge=-180.0, le=180.0),
    city: str = Query("Delhi")
):
    lat = latitude if latitude is not None else settings.DEFAULT_LATITUDE
    lon = longitude if longitude is not None else settings.DEFAULT_LONGITUDE
    return await get_current_weather(lat, lon, city)

@router.get("/traffic", response_model=TrafficResponse)
async def traffic_endpoint(
    latitude: Optional[float] = Query(None, ge=-90.0, le=90.0),
    longitude: Optional[float] = Query(None, ge=-180.0, le=180.0),
    city: str = Query("Delhi")
):
    lat = latitude if latitude is not None else settings.DEFAULT_LATITUDE
    lon = longitude if longitude is not None else settings.DEFAULT_LONGITUDE
    return await get_traffic_status(lat, lon, city)

@router.get("/summary", response_model=EnvironmentalSummary)
async def summary_endpoint(
    latitude: Optional[float] = Query(None, ge=-90.0, le=90.0),
    longitude: Optional[float] = Query(None, ge=-180.0, le=180.0),
    city: str = Query("Delhi")
):
    lat = latitude if latitude is not None else settings.DEFAULT_LATITUDE
    lon = longitude if longitude is not None else settings.DEFAULT_LONGITUDE

    aqi_res = await get_current_aqi(lat, lon, city)
    weather_res = await get_current_weather(lat, lon, city)
    traffic_res = await get_traffic_status(lat, lon, city)

    return EnvironmentalSummary(
        city=city,
        latitude=lat,
        longitude=lon,
        aqi=aqi_res,
        weather=weather_res,
        traffic=traffic_res,
        timestamp=aqi_res.timestamp
    )

@router.get("/history", response_model=HistoricalResponse)
async def history_endpoint(
    city: str = Query("Delhi"),
    limit: int = Query(24, ge=1, le=168)
):
    """
    Returns timestamped environmental observations for time-series charts.
    Pulls from InfluxDB if active, otherwise retrieves from SQLite time-series store.
    """
    points = []
    source = "SQLite Local Time-Series Store"
    
    if is_influx_connected():
        influx_data = query_historical_points(city, range_hours=limit)
        if influx_data:
            points = [HistoricalDataPoint(**p) for p in influx_data]
            source = "InfluxDB Time-Series Engine"

    if not points:
        # Fallback to local SQLite history
        sqlite_data = get_historical_readings(city, limit=limit)
        points = [HistoricalDataPoint(**d) for d in sqlite_data]

    return HistoricalResponse(
        city=city,
        source=source,
        data_points=points,
        total_records=len(points)
    )
