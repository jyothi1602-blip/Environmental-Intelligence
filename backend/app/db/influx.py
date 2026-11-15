import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger("db.influx")

# InfluxDB Client setup
_client = None
_write_api = None
_query_api = None
_influx_available = False

def init_influxdb() -> bool:
    """Attempts to connect to InfluxDB. If offline or port closed, instantly enables graceful fallback."""
    global _client, _write_api, _query_api, _influx_available
    import socket
    from urllib.parse import urlparse

    try:
        parsed = urlparse(settings.INFLUXDB_URL)
        host = parsed.hostname or "localhost"
        port = parsed.port or 8086

        # Fast socket check (100ms) to avoid blocking if daemon is not running
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.2)
        conn_res = sock.connect_ex((host, port))
        sock.close()

        if conn_res != 0:
            logger.info("InfluxDB service port %s:%s not reachable. Operating in hybrid mode with SQLite local time-series store.", host, port)
            _influx_available = False
            return False

        from influxdb_client import InfluxDBClient
        from influxdb_client.client.write_api import SYNCHRONOUS
        
        _client = InfluxDBClient(
            url=settings.INFLUXDB_URL,
            token=settings.INFLUXDB_TOKEN,
            org=settings.INFLUXDB_ORG,
            timeout=1000
        )
        _write_api = _client.write_api(write_options=SYNCHRONOUS)
        _query_api = _client.query_api()
        _influx_available = True
        logger.info("InfluxDB connection established at %s (Bucket: %s)", settings.INFLUXDB_URL, settings.INFLUXDB_BUCKET)
        return True
    except Exception as e:
        logger.info("InfluxDB not reachable (%s). Operating in hybrid mode with SQLite local time-series store.", str(e))
        _influx_available = False
        return False

def is_influx_connected() -> bool:
    return _influx_available

def write_point(
    measurement: str,
    city: str,
    latitude: float,
    longitude: float,
    fields: Dict[str, Any],
    timestamp: Optional[str] = None
) -> bool:
    """Writes a metric point to InfluxDB with tags and fields."""
    if not _influx_available or not _write_api:
        return False
    
    try:
        from influxdb_client import Point
        p = Point(measurement) \
            .tag("city", city) \
            .tag("source", "environmental_intel_hub") \
            .field("latitude", float(latitude)) \
            .field("longitude", float(longitude))
        
        for k, v in fields.items():
            if v is not None:
                p = p.field(k, float(v) if isinstance(v, (int, float)) else str(v))
        
        if timestamp:
            p = p.time(timestamp)
        else:
            p = p.time(datetime.now(timezone.utc))

        _write_api.write(bucket=settings.INFLUXDB_BUCKET, org=settings.INFLUXDB_ORG, record=p)
        return True
    except Exception as e:
        logger.warning("Failed to write point to InfluxDB: %s", str(e))
        return False

def query_historical_points(city: str, range_hours: int = 24) -> List[Dict[str, Any]]:
    """Queries time-series measurements from InfluxDB."""
    if not _influx_available or not _query_api:
        return []
    
    query = f'''
    from(bucket: "{settings.INFLUXDB_BUCKET}")
        |> range(start: -{range_hours}h)
        |> filter(fn: (r) => r._measurement == "environmental_readings")
        |> filter(fn: (r) => r.city == "{city}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"])
    '''
    try:
        result = _query_api.query(org=settings.INFLUXDB_ORG, query=query)
        points = []
        for table in result:
            for record in table.records:
                values = record.values
                points.append({
                    "timestamp": record.get_time().isoformat() if record.get_time() else None,
                    "aqi": int(values.get("aqi", 0)),
                    "pm25": values.get("pm25"),
                    "pm10": values.get("pm10"),
                    "no2": values.get("no2"),
                    "o3": values.get("o3"),
                    "co": values.get("co"),
                    "temperature": values.get("temperature"),
                    "humidity": values.get("humidity")
                })
        return points
    except Exception as e:
        logger.warning("Error querying InfluxDB: %s", str(e))
        return []
