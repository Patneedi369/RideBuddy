from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.chat import ReportCreate, NotificationResponse
from app.models.report import Report, BlockedUser, Notification
from app.models.user import User

router = APIRouter(tags=["Safety & Notifications"])

@router.post("/reports")
def report_user(
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if report_in.reported_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot report yourself.")

    reported_user = db.query(User).filter(User.id == report_in.reported_user_id).first()
    if not reported_user:
        raise HTTPException(status_code=404, detail="User not found")

    report = Report(
        reporter_id=current_user.id,
        reported_user_id=report_in.reported_user_id,
        category=report_in.category,
        description=report_in.description
    )
    db.add(report)
    db.commit()
    return {"message": "Report submitted successfully. Thank you for keeping Ride Buddy safe."}

@router.post("/users/{user_id}/block")
def block_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot block yourself.")

    existing = db.query(BlockedUser).filter(
        BlockedUser.blocker_id == current_user.id,
        BlockedUser.blocked_id == user_id
    ).first()

    if not existing:
        blocked = BlockedUser(
            blocker_id=current_user.id,
            blocked_id=user_id
        )
        db.add(blocked)
        db.commit()

    return {"message": "User blocked successfully."}

@router.get("/notifications", response_model=List[NotificationResponse])
def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
