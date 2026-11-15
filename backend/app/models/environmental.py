from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class PollutantDetail(BaseModel):
    name: str
    symbol: str
    concentration: Optional[float] = None
    unit: str = "µg/m³"
    status: str = "Unavailable"
    status_color: str = "#94A3B8"
    timestamp: str

class AQIResponse(BaseModel):
    aqi: int
    category: str
    color: str
    dominant_pollutant: str
    station_name: str
    latitude: float
    longitude: float
    pollutants: Dict[str, PollutantDetail]
    source: str
    is_demo_mode: bool = False
    timestamp: str

class WeatherResponse(BaseModel):
    temperature: float
    feels_like: float
    humidity: int
    wind_speed: float
    weather_condition: str
    condition_icon: str
    source: str
    timestamp: str

class TrafficResponse(BaseModel):
    status: str
    congestion_level: str
    congestion_index: int
    speed_reduction_pct: int
    source: str
    is_available: bool
    note: str
    timestamp: str

class EnvironmentalSummary(BaseModel):
    city: str
    latitude: float
    longitude: float
    aqi: AQIResponse
    weather: WeatherResponse
    traffic: TrafficResponse
    timestamp: str

class HistoricalDataPoint(BaseModel):
    timestamp: str
    aqi: int
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    o3: Optional[float] = None
    co: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[int] = None

class HistoricalResponse(BaseModel):
    city: str
    source: str
    data_points: List[HistoricalDataPoint]
    total_records: int

