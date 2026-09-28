import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class RequestStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

class RideRequest(Base):
    __tablename__ = "ride_requests"

    id = Column(Integer, primary_key=True, index=True)
    ride_id = Column(Integer, ForeignKey("rides.id"), nullable=False, index=True)
    passenger_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    pickup_name = Column(String, nullable=False)
    pickup_lat = Column(Float, nullable=False)
    pickup_lng = Column(Float, nullable=False)
    
    drop_name = Column(String, nullable=False)
    drop_lat = Column(Float, nullable=False)
    drop_lng = Column(Float, nullable=False)
    
    seats_requested = Column(Integer, default=1, nullable=False)
    status = Column(Enum(RequestStatusEnum), default=RequestStatusEnum.PENDING, nullable=False, index=True)
    
    distance_km = Column(Float, default=0.0)
    route_match_score = Column(Integer, default=100)  # e.g. 92%
    estimated_petrol_share = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    ride = relationship("Ride", back_populates="requests")
    passenger = relationship("User", back_populates="ride_requests")
