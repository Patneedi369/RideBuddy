from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.report import ReportCategoryEnum
from app.schemas.user import UserResponse

class ChatMessageCreate(BaseModel):
    message_text: str = Field(..., min_length=1)

class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ride_id: int
    sender_id: int
    message_text: str
    created_at: datetime
    sender: Optional[UserResponse] = None

class RatingCreate(BaseModel):
    reviewee_id: int
    score: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class RatingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ride_id: int
    reviewer_id: int
    reviewee_id: int
    score: int
    comment: Optional[str] = None
    created_at: datetime
    reviewer: Optional[UserResponse] = None

class ReportCreate(BaseModel):
    reported_user_id: int
    category: ReportCategoryEnum
    description: Optional[str] = None

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    metadata_json: Optional[dict] = None
    created_at: datetime
