from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class NotificationSettings(BaseModel):
    high_pollution_alerts: bool = True
    daily_forecast: bool = True
    health_advisories: bool = True
    traffic_pollution_routing: bool = False

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password (min 6 characters)")
    age_group: str = Field("Adult (18-64)", description="Age group: Child (0-12), Teen (13-17), Adult (18-64), Senior (65+)")
    gender: Optional[str] = Field("Prefer not to say", description="Optional gender identifier")
    city: str = Field("Delhi", description="User's city or municipality")
    notification_settings: Optional[NotificationSettings] = Field(default_factory=NotificationSettings)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    age_group: str
    gender: Optional[str] = None
    city: str
    has_completed_health_profile: bool = False
    has_location_consent: bool = False
    created_at: str

class AuthResponse(BaseModel):
    message: str
    user: UserResponse
    token: str

