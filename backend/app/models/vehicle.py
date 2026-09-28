import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class VehicleTypeEnum(str, enum.Enum):
    CAR = "car"
    BIKE = "bike"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    vehicle_type = Column(Enum(VehicleTypeEnum), nullable=False)
    model = Column(String, nullable=False)
    registration_number = Column(String, nullable=True)
    capacity = Column(Integer, nullable=False)  # max passengers: 1 for bike, 1-6 for car
    mileage_kml = Column(Float, nullable=False, default=15.0)  # km per liter
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="vehicles")
    rides = relationship("Ride", back_populates="vehicle")
