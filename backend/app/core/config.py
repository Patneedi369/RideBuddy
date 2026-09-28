import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Ride Buddy API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ridebuddy")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ridebuddy_super_secret_jwt_key_2026_india")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # Default Fuel & Pricing Config for India
    DEFAULT_FUEL_PRICE_PER_LITER: float = 102.50  # INR per liter
    DEFAULT_CAR_MILEAGE_KML: float = 15.0  # km per liter
    DEFAULT_BIKE_MILEAGE_KML: float = 40.0  # km per liter
    
    # OTP config
    TEST_OTP_CODE: str = "482169"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
