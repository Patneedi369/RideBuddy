from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.request import RequestStatusEnum
from app.schemas.user import UserResponse
from app.schemas.ride import RideResponse

class RideRequestCreate(BaseModel):
    pickup_name: str
    pickup_lat: float
    pickup_lng: float
    drop_name: str
    drop_lat: float
    drop_lng: float
    seats_requested: int = Field(1, ge=1, le=4)

class RideRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ride_id: int
    passenger_id: int
    pickup_name: str
    pickup_lat: float
    pickup_lng: float
    drop_name: str
    drop_lat: float
    drop_lng: float
    seats_requested: int
    status: RequestStatusEnum
    distance_km: float
    route_match_score: int
    estimated_petrol_share: float
    created_at: datetime
    updated_at: datetime
    
    passenger: Optional[UserResponse] = None
    ride: Optional[RideResponse] = None
