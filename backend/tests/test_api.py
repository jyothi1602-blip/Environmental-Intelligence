import pytest
import os
import asyncio
from starlette.testclient import TestClient
from app.main import app
from app.db.sqlite import init_db

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

def test_root_and_health(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["milestone"] == "Milestone 1 (Week 1–2)"
    assert data["status"] == "operational"

    res_h = client.get("/health")
    assert res_h.status_code == 200
    assert res_h.json()["status"] == "healthy"

def test_user_registration_and_login(client):
    import uuid
    rand_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    reg_payload = {
        "full_name": "Dr. Sarah Mitchell",
        "email": rand_email,
        "password": "Password123!",
        "age_group": "Adult (18-64)",
        "gender": "Female",
        "city": "Delhi",
        "notification_settings": {
            "high_pollution_alerts": True,
            "daily_forecast": True,
            "health_advisories": True,
            "traffic_pollution_routing": True
        }
    }
    
    # 1. Register
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200, reg_res.text
    reg_data = reg_res.json()
    assert "token" in reg_data
    assert reg_data["user"]["email"] == rand_email
    token = reg_data["token"]
    user_id = reg_data["user"]["id"]

    # 2. Login
    login_res = client.post("/api/auth/login", json={"email": rand_email, "password": "Password123!"})
    assert login_res.status_code == 200
    assert login_res.json()["user"]["id"] == user_id

    # 3. Get Me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == "Dr. Sarah Mitchell"

    # 4. Save Health Sensitivity Profile with Consent
    health_payload = {
        "conditions": ["Asthma", "Allergies"],
        "sensitivity_group": "Sensitive individuals",
        "additional_notes": "Mild exercise-induced wheezing in high dust conditions.",
        "consent_given": True
    }
    hp_res = client.post("/api/user/health-profile", json=health_payload, headers={"Authorization": f"Bearer {token}"})
    assert hp_res.status_code == 200, hp_res.text
    hp_data = hp_res.json()
    assert hp_data["sensitivity_group"] == "Sensitive individuals"
    assert "Asthma" in hp_data["conditions"]

    # 5. Save Location Consent
    loc_payload = {
        "gps_allowed": True,
        "latitude": 28.6139,
        "longitude": 77.2090,
        "city": "Delhi",
        "consent_given": True
    }
    loc_res = client.post("/api/user/location-consent", json=loc_payload, headers={"Authorization": f"Bearer {token}"})
    assert loc_res.status_code == 200
    assert loc_res.json()["gps_allowed"] is True

    # 6. Verify Health Profile Retrieval
    get_hp_res = client.get("/api/user/health-profile", headers={"Authorization": f"Bearer {token}"})
    assert get_hp_res.status_code == 200
    assert get_hp_res.json()["consent_given"] is True

def test_health_profile_consent_mandatory(client):
    # If consent_given is False, server must reject per privacy rule
    payload = {
        "conditions": ["Asthma"],
        "sensitivity_group": "Sensitive individuals",
        "consent_given": False
    }
    res = client.post("/api/user/health-profile", json=payload, headers={"Authorization": "Bearer token_1_xyz"})
    assert res.status_code == 400
    assert "consent is required" in res.json()["detail"].lower()

def test_environmental_aqi_and_pollutants(client):
    res = client.get("/api/environmental/aqi?latitude=28.6139&longitude=77.2090&city=Delhi")
    assert res.status_code == 200
    data = res.json()
    assert "aqi" in data
    assert data["aqi"] > 0
    assert "pollutants" in data
    pollutants = data["pollutants"]
    for p in ["pm25", "pm10", "no2", "o3", "co"]:
        assert p in pollutants
        assert pollutants[p]["concentration"] is not None
        assert pollutants[p]["unit"] != ""
        assert pollutants[p]["status"] != ""

def test_weather_endpoint(client):
    res = client.get("/api/environmental/weather?latitude=28.6139&longitude=77.2090&city=Delhi")
    assert res.status_code == 200
    data = res.json()
    assert "temperature" in data
    assert "humidity" in data
    assert "wind_speed" in data
    assert "weather_condition" in data

def test_traffic_endpoint(client):
    res = client.get("/api/environmental/traffic?latitude=28.6139&longitude=77.2090&city=Delhi")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "source" in data
    assert "note" in data

def test_environmental_summary(client):
    res = client.get("/api/environmental/summary?latitude=28.6139&longitude=77.2090&city=Delhi")
    assert res.status_code == 200
    data = res.json()
    assert "aqi" in data
    assert "weather" in data
    assert "traffic" in data
    assert data["city"] == "Delhi"

def test_historical_endpoint(client):
    res = client.get("/api/environmental/history?city=Delhi&limit=10")
    assert res.status_code == 200
    data = res.json()
    assert "data_points" in data
    assert len(data["data_points"]) > 0
    dp = data["data_points"][0]
    assert "aqi" in dp
    assert "timestamp" in dp

def test_personalized_alerts(client):
    # Test personalized alerts with an authenticated user token
    res = client.get("/api/alerts/personalized?latitude=28.6139&longitude=77.2090&city=Delhi", headers={"Authorization": "Bearer token_1_xyz"})
    assert res.status_code == 200
    data = res.json()
    assert "alerts" in data
    assert "disclaimer" in data
    assert len(data["alerts"]) > 0
    assert "medical diagnosis" in data["disclaimer"].lower()
