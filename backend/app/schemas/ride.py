from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.ride import RideStatusEnum, TravelPreferenceEnum
from app.schemas.user import UserResponse
from app.schemas.vehicle import VehicleResponse

class WaypointSchema(BaseModel):
    name: str
    lat: float
    lng: float
    order: int

class RideCreate(BaseModel):
    vehicle_id: int
    origin_name: str
    origin_lat: float
    origin_lng: float
    destination_name: str
    destination_lat: float
    destination_lng: float
    departure_time: datetime
    travel_preference: TravelPreferenceEnum = TravelPreferenceEnum.ANYONE
    total_seats: int = Field(..., ge=1, le=6)
    waypoints: Optional[List[WaypointSchema]] = []

class RideSearchQuery(BaseModel):
    origin_lat: float
    origin_lng: float
    destination_lat: float
    destination_lng: float
    travel_date: Optional[str] = None
    travel_preference: TravelPreferenceEnum = TravelPreferenceEnum.ANYONE

class RideResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    driver_id: int
    vehicle_id: int
    origin_name: str
    origin_lat: float
    origin_lng: float
    destination_name: str
    destination_lat: float
    destination_lng: float
    departure_time: datetime
    estimated_arrival: Optional[datetime] = None
    travel_preference: TravelPreferenceEnum
    total_seats: int
    available_seats: int
    status: RideStatusEnum
    waypoints_json: Optional[List[dict]] = []
    total_distance_km: float
    fuel_price_per_liter: float
    created_at: datetime
    
    driver: Optional[UserResponse] = None
    vehicle: Optional[VehicleResponse] = None

class RideSearchResult(BaseModel):
    ride: RideResponse
    route_match_score: int
    segment_distance_km: float
    estimated_petrol_share: float
    pickup_name: str
    drop_name: str
