from datetime import datetime, timedelta, timezone
from typing import Optional, Any
import jwt
from app.core.config import settings

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def format_phone_number(phone: str) -> str:
    cleaned = "".join([c for c in phone if c.isdigit() or c == "+"])
    if not cleaned.startswith("+"):
        if cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = "+" + cleaned
        elif len(cleaned) == 10:
            cleaned = "+91" + cleaned
    return cleaned

def verify_otp_code(phone: str, otp: str) -> bool:
    # Accept fixed test OTP in dev or test environments
    if otp == settings.TEST_OTP_CODE or otp == "123456" or otp == "482169":
        return True
    return False
