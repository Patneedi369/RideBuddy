from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse
from app.models.chat import RideMessage
from app.models.ride import Ride
from app.models.request import RideRequest, RequestStatusEnum
from app.models.user import User

router = APIRouter(prefix="/rides", tags=["Chat"])

@router.post("/{ride_id}/messages", response_model=ChatMessageResponse)
def send_ride_message(
    ride_id: int,
    msg_in: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    # Authorization check: user must be driver or an accepted/pending passenger
    is_driver = ride.driver_id == current_user.id
    is_passenger = db.query(RideRequest).filter(
        RideRequest.ride_id == ride_id,
        RideRequest.passenger_id == current_user.id,
        RideRequest.status.in_([RequestStatusEnum.ACCEPTED, RequestStatusEnum.PENDING])
    ).first() is not None

    if not (is_driver or is_passenger):
        raise HTTPException(
            status_code=403,
            detail="You must be a confirmed participant in this ride to send chat messages."
        )

    msg = RideMessage(
        ride_id=ride_id,
        sender_id=current_user.id,
        message_text=msg_in.message_text
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

@router.get("/{ride_id}/messages", response_model=List[ChatMessageResponse])
def get_ride_messages(
    ride_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    is_driver = ride.driver_id == current_user.id
    is_passenger = db.query(RideRequest).filter(
        RideRequest.ride_id == ride_id,
        RideRequest.passenger_id == current_user.id,
        RideRequest.status.in_([RequestStatusEnum.ACCEPTED, RequestStatusEnum.PENDING])
    ).first() is not None

    if not (is_driver or is_passenger):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view messages for this ride."
        )

    messages = db.query(RideMessage).options(
        joinedload(RideMessage.sender)
    ).filter(RideMessage.ride_id == ride_id).order_by(RideMessage.created_at.asc()).all()

    return messages
