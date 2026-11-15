import logging
from fastapi import APIRouter, HTTPException, Depends
from app.models.user import (
    HealthProfileCreate, HealthProfileResponse,
    LocationConsentRequest, LocationConsentResponse,
    UserProfileUpdate
)
from app.models.auth import UserResponse
from app.routes.auth import get_current_user_id
from app.db.sqlite import (
    save_health_profile, get_health_profile, delete_health_profile,
    save_location_consent, get_location_consent,
    get_user_by_id, update_user_profile, delete_user_account
)

logger = logging.getLogger("routes.user")
router = APIRouter(prefix="/api/user", tags=["User Profile & Privacy"])

# ==================== Health Sensitivity Endpoints ====================

@router.post("/health-profile", response_model=HealthProfileResponse)
@router.put("/health-profile", response_model=HealthProfileResponse)
async def update_health_profile(profile_data: HealthProfileCreate, user_id: int = Depends(get_current_user_id)):
    if not profile_data.consent_given:
        raise HTTPException(
            status_code=400,
            detail="Explicit user consent is required before processing voluntary health-related sensitivity selections."
        )

    res = save_health_profile(
        user_id=user_id,
        conditions=profile_data.conditions,
        sensitivity_group=profile_data.sensitivity_group,
        additional_notes=profile_data.additional_notes,
        consent_given=profile_data.consent_given
    )
    return HealthProfileResponse(**res)

@router.get("/health-profile", response_model=HealthProfileResponse)
async def fetch_health_profile(user_id: int = Depends(get_current_user_id)):
    res = get_health_profile(user_id)
    if not res:
        return HealthProfileResponse(
            user_id=user_id,
            conditions=[],
            sensitivity_group="General",
            additional_notes=None,
            consent_given=False,
            updated_at=""
        )
    return HealthProfileResponse(**res)

@router.delete("/health-profile")
async def remove_health_profile(user_id: int = Depends(get_current_user_id)):
    deleted = delete_health_profile(user_id)
    return {"message": "Health sensitivity profile deleted successfully.", "deleted": deleted}

# ==================== Location & GPS Consent ====================

@router.post("/location-consent", response_model=LocationConsentResponse)
async def update_location_consent(loc_data: LocationConsentRequest, user_id: int = Depends(get_current_user_id)):
    if not loc_data.consent_given:
        raise HTTPException(
            status_code=400,
            detail="Explicit consent is required to process device location coordinates."
        )

    res = save_location_consent(
        user_id=user_id,
        gps_allowed=loc_data.gps_allowed,
        latitude=loc_data.latitude,
        longitude=loc_data.longitude,
        city=loc_data.city,
        consent_given=loc_data.consent_given
    )
    return LocationConsentResponse(**res)

@router.get("/location-consent", response_model=LocationConsentResponse)
async def fetch_location_consent(user_id: int = Depends(get_current_user_id)):
    res = get_location_consent(user_id)
    if not res:
        return LocationConsentResponse(
            user_id=user_id,
            gps_allowed=False,
            latitude=None,
            longitude=None,
            city="Delhi",
            updated_at=""
        )
    return LocationConsentResponse(**res)

# ==================== User Account Management ====================

@router.put("/profile", response_model=UserResponse)
async def update_profile(data: UserProfileUpdate, user_id: int = Depends(get_current_user_id)):
    update_user_profile(
        user_id,
        full_name=data.full_name,
        age_group=data.age_group,
        gender=data.gender,
        city=data.city
    )
    user_row = get_user_by_id(user_id)
    health = get_health_profile(user_id)
    loc = get_location_consent(user_id)
    return UserResponse(
        id=user_id,
        full_name=user_row["full_name"],
        email=user_row["email"],
        age_group=user_row["age_group"],
        gender=user_row["gender"],
        city=user_row["city"],
        has_completed_health_profile=health is not None,
        has_location_consent=loc is not None,
        created_at=user_row["created_at"]
    )

@router.delete("/account")
async def delete_account(user_id: int = Depends(get_current_user_id)):
    deleted = delete_user_account(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User account not found.")
    return {"message": "Account and all associated personal data have been permanently erased."}
