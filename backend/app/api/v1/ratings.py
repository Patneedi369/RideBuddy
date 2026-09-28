from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.chat import RatingCreate, RatingResponse
from app.models.rating import Rating
from app.models.ride import Ride, RideStatusEnum
from app.models.request import RideRequest, RequestStatusEnum
from app.models.user import User

router = APIRouter(tags=["Ratings"])

@router.post("/rides/{ride_id}/ratings", response_model=RatingResponse)
def rate_user(
    ride_id: int,
    rating_in: RatingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.status != RideStatusEnum.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail="Ratings can only be submitted for completed rides."
        )

    # Verify reviewer and reviewee were participants in this ride
    is_driver = ride.driver_id in (current_user.id, rating_in.reviewee_id)
    passenger_ids = [r.passenger_id for r in db.query(RideRequest).filter(
        RideRequest.ride_id == ride_id,
        RideRequest.status == RequestStatusEnum.ACCEPTED
    ).all()]

    valid_participants = set(passenger_ids + [ride.driver_id])
    if current_user.id not in valid_participants or rating_in.reviewee_id not in valid_participants:
        raise HTTPException(
            status_code=403,
            detail="Both reviewer and reviewee must be participants in this completed ride."
        )

    if current_user.id == rating_in.reviewee_id:
        raise HTTPException(status_code=400, detail="You cannot rate yourself.")

    # Check if rating already exists
    existing = db.query(Rating).filter(
        Rating.ride_id == ride_id,
        Rating.reviewer_id == current_user.id,
        Rating.reviewee_id == rating_in.reviewee_id
    ).first()

    if existing:
        existing.score = rating_in.score
        existing.comment = rating_in.comment
        db.commit()
        db.refresh(existing)
        return existing

    rating = Rating(
        ride_id=ride_id,
        reviewer_id=current_user.id,
        reviewee_id=rating_in.reviewee_id,
        score=rating_in.score,
        comment=rating_in.comment
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return rating

@router.get("/users/{user_id}/ratings", response_model=List[RatingResponse])
def get_user_ratings(
    user_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Rating).options(joinedload(Rating.reviewer)).filter(Rating.reviewee_id == user_id).all()
