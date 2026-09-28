from pydantic import BaseModel, Field
from typing import Optional

class PhoneSendOTPRequest(BaseModel):
    phone_number: str = Field(..., json_schema_extra={"example": "+919876543210"})

class OTPVerifyRequest(BaseModel):
    phone_number: str = Field(..., json_schema_extra={"example": "+919876543210"})
    otp_code: str = Field(..., json_schema_extra={"example": "482169"})

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    is_new_user: bool
    is_profile_complete: bool
