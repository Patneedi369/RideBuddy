from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.vehicle import VehicleTypeEnum

class VehicleCreate(BaseModel):
    vehicle_type: VehicleTypeEnum
    model: str = Field(..., json_schema_extra={"example": "Honda City"})
    registration_number: Optional[str] = Field(None, json_schema_extra={"example": "AP 39 AB 1234"})
    capacity: int = Field(..., ge=1, le=6, json_schema_extra={"example": 4})
    mileage_kml: float = Field(..., gt=0, json_schema_extra={"example": 15.0})

class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    vehicle_type: VehicleTypeEnum
    model: str
    registration_number: Optional[str] = None
    capacity: int
    mileage_kml: float
    created_at: datetime
