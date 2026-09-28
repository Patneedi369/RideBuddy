from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import format_phone_number, verify_otp_code, create_access_token
from app.schemas.auth import PhoneSendOTPRequest, OTPVerifyRequest, TokenResponse
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/send-otp")
def send_otp(request: PhoneSendOTPRequest, db: Session = Depends(get_db)):
    phone = format_phone_number(request.phone_number)
    if len(phone) < 10:
        raise HTTPException(status_code=400, detail="Please enter a valid phone number")
    
    # Check if user already exists
    user = db.query(User).filter(User.phone_number == phone).first()
    is_existing = user is not None
    
    return {
        "message": f"OTP sent to {phone}",
        "phone_number": phone,
        "is_existing_user": is_existing,
        "test_otp": "482169"  # Development convenience
    }

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    phone = format_phone_number(request.phone_number)
    if not verify_otp_code(phone, request.otp_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. Please try again."
        )
    
    user = db.query(User).filter(User.phone_number == phone).first()
    is_new_user = False
    
    if not user:
        # Create new uncompleted user
        user = User(
            phone_number=phone,
            is_verified=True,
            is_profile_complete=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        is_new_user = True

    token = create_access_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        is_new_user=is_new_user,
        is_profile_complete=user.is_profile_complete
    )
