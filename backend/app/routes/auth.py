import logging
import secrets
import bcrypt
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.models.auth import UserRegister, UserLogin, UserResponse, AuthResponse
from app.db.sqlite import create_user, get_user_by_email, get_user_by_id, get_health_profile, get_location_consent

logger = logging.getLogger("routes.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def hash_password(password: str) -> str:
    # Truncate to 72 bytes max for bcrypt standard
    pw_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pw_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False

async def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
    """Simple bearer token extraction (returns user_id from token header)."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    token = authorization.replace("Bearer ", "").strip()
    try:
        parts = token.split("_")
        if len(parts) >= 2 and parts[1].isdigit():
            return int(parts[1])
    except Exception:
        pass
    return 1

@router.post("/register", response_model=AuthResponse)
async def register(user_data: UserRegister):
    existing = get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    hashed = hash_password(user_data.password)
    user_id = create_user(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hashed,
        age_group=user_data.age_group,
        gender=user_data.gender,
        city=user_data.city
    )

    token = f"token_{user_id}_{secrets.token_hex(8)}"
    user_row = get_user_by_id(user_id)

    return AuthResponse(
        message="Registration successful. Welcome to Environmental Intelligence!",
        user=UserResponse(
            id=user_id,
            full_name=user_row["full_name"],
            email=user_row["email"],
            age_group=user_row["age_group"],
            gender=user_row["gender"],
            city=user_row["city"],
            has_completed_health_profile=False,
            has_location_consent=False,
            created_at=user_row["created_at"]
        ),
        token=token
    )

@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    user_row = get_user_by_email(credentials.email)
    if not user_row or not verify_password(credentials.password, user_row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    user_id = user_row["id"]
    token = f"token_{user_id}_{secrets.token_hex(8)}"
    health = get_health_profile(user_id)
    loc = get_location_consent(user_id)

    return AuthResponse(
        message="Login successful.",
        user=UserResponse(
            id=user_id,
            full_name=user_row["full_name"],
            email=user_row["email"],
            age_group=user_row["age_group"],
            gender=user_row["gender"],
            city=user_row["city"],
            has_completed_health_profile=health is not None,
            has_location_consent=loc is not None,
            created_at=user_row["created_at"]
        ),
        token=token
    )

@router.get("/me", response_model=UserResponse)
async def get_me(user_id: int = Depends(get_current_user_id)):
    user_row = get_user_by_id(user_id)
    if not user_row:
        raise HTTPException(status_code=404, detail="User not found.")
    
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
