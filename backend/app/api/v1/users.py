from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.user import UserProfileCreate, UserProfileUpdate, UserResponse
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/me/profile", response_model=UserResponse)
def create_profile(
    profile_data: UserProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.name = profile_data.name
    current_user.gender = profile_data.gender
    if profile_data.profile_photo:
        current_user.profile_photo = profile_data.profile_photo
    current_user.is_profile_complete = True
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.name is not None:
        current_user.name = profile_data.name
    if profile_data.gender is not None:
        current_user.gender = profile_data.gender
    if profile_data.profile_photo is not None:
        current_user.profile_photo = profile_data.profile_photo
        
    db.commit()
    db.refresh(current_user)
    return current_user
