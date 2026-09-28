from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.vehicle import VehicleCreate, VehicleResponse
from app.models.vehicle import Vehicle, VehicleTypeEnum
from app.models.user import User

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.post("", response_model=VehicleResponse)
def create_vehicle(
    vehicle_in: VehicleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce capacity constraint for Bike vs Car
    if vehicle_in.vehicle_type == VehicleTypeEnum.BIKE and vehicle_in.capacity > 1:
        raise HTTPException(
            status_code=400,
            detail="A bike can only offer 1 passenger seat."
        )
        
    vehicle = Vehicle(
        user_id=current_user.id,
        vehicle_type=vehicle_in.vehicle_type,
        model=vehicle_in.model,
        registration_number=vehicle_in.registration_number,
        capacity=vehicle_in.capacity,
        mileage_kml=vehicle_in.mileage_kml
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.get("", response_model=List[VehicleResponse])
def get_my_vehicles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Vehicle).filter(Vehicle.user_id == current_user.id).all()

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
    return {"message": "Vehicle deleted successfully"}
