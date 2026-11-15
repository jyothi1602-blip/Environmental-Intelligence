import os
from pathlib import Path
from dotenv import load_dotenv

# Locate .env file
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "Environmental Intelligence API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default-dev-secret-key-32charsmin")

    # SQLite
    DB_PATH: str = str(BASE_DIR / "environmental_intel.db")

    # InfluxDB
    INFLUXDB_URL: str = os.getenv("INFLUXDB_URL", "http://localhost:8086")
    INFLUXDB_TOKEN: str = os.getenv("INFLUXDB_TOKEN", "default-token")
    INFLUXDB_ORG: str = os.getenv("INFLUXDB_ORG", "env_intel_org")
    INFLUXDB_BUCKET: str = os.getenv("INFLUXDB_BUCKET", "environmental_readings")

    # External APIs
    OPENAQ_API_KEY: str = os.getenv("OPENAQ_API_KEY", "")
    WAQI_API_TOKEN: str = os.getenv("WAQI_API_TOKEN", "")
    OPENWEATHERMAP_API_KEY: str = os.getenv("OPENWEATHERMAP_API_KEY", "")
    TOMTOM_API_KEY: str = os.getenv("TOMTOM_API_KEY", "")
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")

    # Default Coordinates
    DEFAULT_LATITUDE: float = float(os.getenv("DEFAULT_LATITUDE", "28.6139"))
    DEFAULT_LONGITUDE: float = float(os.getenv("DEFAULT_LONGITUDE", "77.2090"))
    DEFAULT_CITY: str = os.getenv("DEFAULT_CITY", "Delhi")

settings = Settings()
