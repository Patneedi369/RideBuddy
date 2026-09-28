import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class GenderEnum(str, enum.Enum):
    FEMALE = "female"
    MALE = "male"
    OTHER = "other"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    gender = Column(Enum(GenderEnum), nullable=True)
    profile_photo = Column(String, nullable=True)
    is_verified = Column(Boolean, default=True)
    is_profile_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    vehicles = relationship("Vehicle", back_populates="owner", cascade="all, delete-orphan")
    offered_rides = relationship("Ride", back_populates="driver", cascade="all, delete-orphan")
    ride_requests = relationship("RideRequest", back_populates="passenger", cascade="all, delete-orphan")
    given_ratings = relationship("Rating", foreign_keys="Rating.reviewer_id", back_populates="reviewer")
    received_ratings = relationship("Rating", foreign_keys="Rating.reviewee_id", back_populates="reviewee")
