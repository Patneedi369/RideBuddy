import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class RideStatusEnum(str, enum.Enum):
    PUBLISHED = "PUBLISHED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class TravelPreferenceEnum(str, enum.Enum):
    ANYONE = "anyone"
    WOMEN_ONLY = "women_only"

class Ride(Base):
    __tablename__ = "rides"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    
    origin_name = Column(String, nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    
    destination_name = Column(String, nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    
    departure_time = Column(DateTime, nullable=False, index=True)
    estimated_arrival = Column(DateTime, nullable=True)
    
    travel_preference = Column(Enum(TravelPreferenceEnum), default=TravelPreferenceEnum.ANYONE, nullable=False)
    total_seats = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    
    status = Column(Enum(RideStatusEnum), default=RideStatusEnum.PUBLISHED, nullable=False, index=True)
    
    # Store intermediate stops / waypoints as JSON array of {"name": str, "lat": float, "lng": float, "order": int}
    waypoints_json = Column(JSON, nullable=True, default=list)
    total_distance_km = Column(Float, default=0.0)
    fuel_price_per_liter = Column(Float, default=102.50)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    driver = relationship("User", back_populates="offered_rides")
    vehicle = relationship("Vehicle", back_populates="rides")
    requests = relationship("RideRequest", back_populates="ride", cascade="all, delete-orphan")
    messages = relationship("RideMessage", back_populates="ride", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="ride", cascade="all, delete-orphan")
