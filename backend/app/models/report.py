import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, Boolean, JSON
from app.core.database import Base

class ReportCategoryEnum(str, enum.Enum):
    UNSAFE_BEHAVIOR = "Unsafe behavior"
    HARASSMENT = "Harassment"
    WRONG_INFO = "Wrong information"
    NO_SHOW = "No-show"
    OTHER = "Other"

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    reported_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(Enum(ReportCategoryEnum), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class BlockedUser(Base):
    __tablename__ = "blocked_users"

    id = Column(Integer, primary_key=True, index=True)
    blocker_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    blocked_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False)  # e.g., REQUEST_RECEIVED, RIDE_STARTED, etc.
    is_read = Column(Boolean, default=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
