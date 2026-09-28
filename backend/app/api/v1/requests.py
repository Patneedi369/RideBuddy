from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.request import RideRequestCreate, RideRequestResponse
from app.models.request import RideRequest, RequestStatusEnum
from app.models.ride import Ride, RideStatusEnum, TravelPreferenceEnum
from app.models.user import User, GenderEnum
from app.services.route_matching import calculate_route_overlap, haversine_distance
from app.services.petrol_calculator import calculate_estimated_petrol_share

router = APIRouter(tags=["Ride Requests"])

@router.post("/rides/{ride_id}/requests", response_model=RideRequestResponse)
def request_seat(
    ride_id: int,
    request_in: RideRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).options(joinedload(Ride.vehicle), joinedload(Ride.driver)).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
        
    if ride.driver_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot request a seat on your own ride")

    if ride.status != RideStatusEnum.PUBLISHED:
        raise HTTPException(status_code=400, detail="This ride is no longer accepting requests")

    if ride.available_seats < request_in.seats_requested:
        raise HTTPException(status_code=400, detail="Not enough seats available")

    # Enforce Women-only rule
    if ride.travel_preference == TravelPreferenceEnum.WOMEN_ONLY:
        if current_user.gender != GenderEnum.FEMALE:
            raise HTTPException(
                status_code=403,
                detail="This ride is reserved for female passengers only."
            )

    # Calculate segment distance and petrol share
    waypoints = ride.waypoints_json or [
        {"lat": ride.origin_lat, "lng": ride.origin_lng},
        {"lat": ride.destination_lat, "lng": ride.destination_lng}
    ]
    
    overlap = calculate_route_overlap(
        waypoints=waypoints,
        pickup_lat=request_in.pickup_lat,
        pickup_lng=request_in.pickup_lng,
        drop_lat=request_in.drop_lat,
        drop_lng=request_in.drop_lng
    )

    segment_km = overlap["segment_distance_km"] if overlap["is_match"] else haversine_distance(request_in.pickup_lat, request_in.pickup_lng, request_in.drop_lat, request_in.drop_lng)
    match_score = overlap["match_score"] if overlap["is_match"] else 75
    
    vehicle = ride.vehicle
    mileage = vehicle.mileage_kml if vehicle else 15.0
    
    est_petrol = calculate_estimated_petrol_share(
        distance_km=segment_km,
        vehicle_type=vehicle.vehicle_type.value if vehicle else "car",
        mileage_kml=mileage,
        fuel_price_per_liter=ride.fuel_price_per_liter,
        number_of_people=2
    )

    req = RideRequest(
        ride_id=ride.id,
        passenger_id=current_user.id,
        pickup_name=request_in.pickup_name,
        pickup_lat=request_in.pickup_lat,
        pickup_lng=request_in.pickup_lng,
        drop_name=request_in.drop_name,
        drop_lat=request_in.drop_lat,
        drop_lng=request_in.drop_lng,
        seats_requested=request_in.seats_requested,
        status=RequestStatusEnum.PENDING,
        distance_km=round(segment_km, 1),
        route_match_score=match_score,
        estimated_petrol_share=est_petrol
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.get("/rides/{ride_id}/requests", response_model=List[RideRequestResponse])
def get_ride_requests(
    ride_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
        
    if ride.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the driver can view ride requests")

    requests = db.query(RideRequest).options(joinedload(RideRequest.passenger)).filter(RideRequest.ride_id == ride_id).all()
    return requests

@router.post("/requests/{request_id}/accept", response_model=RideRequestResponse)
def accept_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(RideRequest).options(joinedload(RideRequest.ride)).filter(RideRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Ride request not found")
        
    ride = req.ride
    if ride.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the driver can accept this request")

    if req.status != RequestStatusEnum.PENDING:
        raise HTTPException(status_code=400, detail=f"Request is already {req.status.value}")

    if ride.available_seats < req.seats_requested:
        raise HTTPException(status_code=400, detail="Not enough available seats to accept request")

    # Atomic seat deduction
    ride.available_seats -= req.seats_requested
    req.status = RequestStatusEnum.ACCEPTED
    
    db.commit()
    db.refresh(req)
    return req

@router.post("/requests/{request_id}/reject", response_model=RideRequestResponse)
def reject_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(RideRequest).options(joinedload(RideRequest.ride)).filter(RideRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Ride request not found")
        
    ride = req.ride
    if ride.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the driver can reject this request")

    req.status = RequestStatusEnum.REJECTED
    db.commit()
    db.refresh(req)
    return req

@router.post("/requests/{request_id}/cancel", response_model=RideRequestResponse)
def cancel_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(RideRequest).options(joinedload(RideRequest.ride)).filter(RideRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Ride request not found")
        
    if req.passenger_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the passenger can cancel this request")

    # If it was accepted previously, restore seats
    if req.status == RequestStatusEnum.ACCEPTED:
        req.ride.available_seats += req.seats_requested

    req.status = RequestStatusEnum.CANCELLED
    db.commit()
    db.refresh(req)
    return req
