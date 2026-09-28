from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.user import GenderEnum

class UserProfileCreate(BaseModel):
    name: str
    gender: GenderEnum
    profile_photo: Optional[str] = None

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[GenderEnum] = None
    profile_photo: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    phone_number: str
    name: Optional[str] = None
    gender: Optional[GenderEnum] = None
    profile_photo: Optional[str] = None
    is_verified: bool
    is_profile_complete: bool
    created_at: datetime
