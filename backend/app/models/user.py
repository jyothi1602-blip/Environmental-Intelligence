from pydantic import BaseModel, Field
from typing import List, Optional

class HealthProfileCreate(BaseModel):
    conditions: List[str] = Field(
        default_factory=list,
        description="Selectable conditions: Asthma, Respiratory sensitivity, Allergies, Other respiratory conditions, No known sensitivity"
    )
    sensitivity_group: str = Field(
        "General",
        description="Applicable group: General, Children, Elderly, Sensitive individuals"
    )
    additional_notes: Optional[str] = Field(None, max_length=500)
    consent_given: bool = Field(..., description="Explicit consent to process voluntary health sensitivity preferences")

class HealthProfileResponse(BaseModel):
    user_id: int
    conditions: List[str]
    sensitivity_group: str
    additional_notes: Optional[str] = None
    consent_given: bool
    updated_at: str

class LocationConsentRequest(BaseModel):
    gps_allowed: bool = Field(..., description="True if device GPS permission was granted, False if manual city")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    city: Optional[str] = Field(None, max_length=100)
    consent_given: bool = Field(..., description="Consent to use location coordinates for localized AQI retrieval")

class LocationConsentResponse(BaseModel):
    user_id: int
    gps_allowed: bool
    latitude: Optional[float]
    longitude: Optional[float]
    city: str
    updated_at: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age_group: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None

