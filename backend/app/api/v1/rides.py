from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.ride import RideCreate, RideResponse, RideSearchResult
from app.models.ride import Ride, RideStatusEnum, TravelPreferenceEnum
from app.models.vehicle import Vehicle, VehicleTypeEnum
from app.models.user import User, GenderEnum
from app.models.request import RideRequest, RequestStatusEnum
from app.services.route_matching import calculate_route_overlap, haversine_distance
from app.services.petrol_calculator import calculate_estimated_petrol_share

router = APIRouter(prefix="/rides", tags=["Rides"])

@router.post("", response_model=RideResponse)
def create_ride(
    ride_in: RideCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify vehicle ownership
    vehicle = db.query(Vehicle).filter(Vehicle.id == ride_in.vehicle_id, Vehicle.user_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found or does not belong to user")
        
    # Enforce vehicle seat capacity limit
    if ride_in.total_seats > vehicle.capacity:
        raise HTTPException(status_code=400, detail=f"Vehicle capacity is only {vehicle.capacity} seats")

    # Enforce Women-only rule: Only female drivers can create a Women-only ride
    if ride_in.travel_preference == TravelPreferenceEnum.WOMEN_ONLY:
        if current_user.gender != GenderEnum.FEMALE:
            raise HTTPException(
                status_code=403,
                detail="Only female users can offer a Women-only ride."
            )

    # Build waypoints JSON list
    waypoints = [{"name": ride_in.origin_name, "lat": ride_in.origin_lat, "lng": ride_in.origin_lng, "order": 0}]
    if ride_in.waypoints:
        for idx, wp in enumerate(ride_in.waypoints, start=1):
            waypoints.append({"name": wp.name, "lat": wp.lat, "lng": wp.lng, "order": idx})
    waypoints.append({"name": ride_in.destination_name, "lat": ride_in.destination_lat, "lng": ride_in.destination_lng, "order": len(waypoints)})

    # Total route distance
    total_dist = 0.0
    for i in range(len(waypoints) - 1):
        total_dist += haversine_distance(waypoints[i]["lat"], waypoints[i]["lng"], waypoints[i+1]["lat"], waypoints[i+1]["lng"])

    ride = Ride(
        driver_id=current_user.id,
        vehicle_id=vehicle.id,
        origin_name=ride_in.origin_name,
        origin_lat=ride_in.origin_lat,
        origin_lng=ride_in.origin_lng,
        destination_name=ride_in.destination_name,
        destination_lat=ride_in.destination_lat,
        destination_lng=ride_in.destination_lng,
        departure_time=ride_in.departure_time,
        travel_preference=ride_in.travel_preference,
        total_seats=ride_in.total_seats,
        available_seats=ride_in.total_seats,
        status=RideStatusEnum.PUBLISHED,
        waypoints_json=waypoints,
        total_distance_km=round(total_dist, 1),
        fuel_price_per_liter=102.50
    )
    db.add(ride)
    db.commit()
    db.refresh(ride)
    return ride

@router.get("/search", response_model=List[RideSearchResult])
def search_rides(
    origin_lat: float,
    origin_lng: float,
    destination_lat: float,
    destination_lng: float,
    pickup_name: Optional[str] = "Pickup point",
    drop_name: Optional[str] = "Drop point",
    travel_preference: Optional[TravelPreferenceEnum] = TravelPreferenceEnum.ANYONE,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce Women-only filter: if passenger requests women_only search, passenger MUST be female
    if travel_preference == TravelPreferenceEnum.WOMEN_ONLY:
        if current_user.gender != GenderEnum.FEMALE:
            raise HTTPException(
                status_code=403,
                detail="Women-only search preference is reserved for female passengers."
            )

    # Query published rides with available seats
    query = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.vehicle)
    ).filter(
        Ride.status == RideStatusEnum.PUBLISHED,
        Ride.available_seats > 0,
        Ride.driver_id != current_user.id
    )

    results = []
    rides = query.all()

    for ride in rides:
        driver = ride.driver
        vehicle = ride.vehicle
        
        # Gender filtering
        if ride.travel_preference == TravelPreferenceEnum.WOMEN_ONLY:
            if driver.gender != GenderEnum.FEMALE or current_user.gender != GenderEnum.FEMALE:
                continue  # Skip non-compatible women-only rides
                
        if travel_preference == TravelPreferenceEnum.WOMEN_ONLY:
            if driver.gender != GenderEnum.FEMALE:
                continue

        # Route Overlap Matching
        waypoints = ride.waypoints_json or [
            {"lat": ride.origin_lat, "lng": ride.origin_lng},
            {"lat": ride.destination_lat, "lng": ride.destination_lng}
        ]
        
        overlap = calculate_route_overlap(
            waypoints=waypoints,
            pickup_lat=origin_lat,
            pickup_lng=origin_lng,
            drop_lat=destination_lat,
            drop_lng=destination_lng
        )

        if overlap["is_match"]:
            segment_km = overlap["segment_distance_km"]
            mileage = vehicle.mileage_kml if vehicle else 15.0
            fuel_price = ride.fuel_price_per_liter
            
            # Calculate estimated petrol share
            est_petrol = calculate_estimated_petrol_share(
                distance_km=segment_km,
                vehicle_type=vehicle.vehicle_type.value if vehicle else "car",
                mileage_kml=mileage,
                fuel_price_per_liter=fuel_price,
                number_of_people=2
            )

            results.append(RideSearchResult(
                ride=ride,
                route_match_score=overlap["match_score"],
                segment_distance_km=segment_km,
                estimated_petrol_share=est_petrol,
                pickup_name=pickup_name,
                drop_name=drop_name
            ))

    # Sort by best route match score descending
    results.sort(key=lambda x: x.route_match_score, reverse=True)
    return results

@router.get("/my/upcoming", response_model=List[RideResponse])
def get_my_upcoming_rides(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Rides offered by user that are PUBLISHED or IN_PROGRESS
    driver_rides = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.vehicle)
    ).filter(
        Ride.driver_id == current_user.id,
        Ride.status.in_([RideStatusEnum.PUBLISHED, RideStatusEnum.IN_PROGRESS])
    ).all()

    # Rides joined by user as passenger (ACCEPTED requests)
    passenger_requests = db.query(RideRequest).filter(
        RideRequest.passenger_id == current_user.id,
        RideRequest.status == RequestStatusEnum.ACCEPTED
    ).all()
    
    passenger_ride_ids = [r.ride_id for r in passenger_requests]
    passenger_rides = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.vehicle)
    ).filter(
        Ride.id.in_(passenger_ride_ids),
        Ride.status.in_([RideStatusEnum.PUBLISHED, RideStatusEnum.IN_PROGRESS])
    ).all()

    # Combine unique rides
    combined = {r.id: r for r in driver_rides + passenger_rides}
    return list(combined.values())

@router.get("/my/history", response_model=List[RideResponse])
def get_my_ride_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    driver_rides = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.vehicle)
    ).filter(
        Ride.driver_id == current_user.id,
        Ride.status.in_([RideStatusEnum.COMPLETED, RideStatusEnum.CANCELLED])
    ).all()

    passenger_requests = db.query(RideRequest).filter(
        RideRequest.passenger_id == current_user.id,
        RideRequest.status.in_([RequestStatusEnum.ACCEPTED, RequestStatusEnum.COMPLETED])
    ).all()
    
    passenger_ride_ids = [r.ride_id for r in passenger_requests]
    passenger_rides = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.vehicle)
    ).filter(
        Ride.id.in_(passenger_ride_ids),
        Ride.status.in_([RideStatusEnum.COMPLETED, RideStatusEnum.CANCELLED])
    ).all()

    combined = {r.id: r for r in driver_rides + passenger_rides}
    return list(combined.values())

@router.get("/{ride_id}", response_model=RideResponse)
def get_ride_details(
    ride_id: int,
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.vehicle)
    ).filter(Ride.id == ride_id).first()
    
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    return ride

@router.post("/{ride_id}/start", response_model=RideResponse)
def start_ride(
    ride_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the driver can start this ride")
        
    ride.status = RideStatusEnum.IN_PROGRESS
    db.commit()
    db.refresh(ride)
    return ride

@router.post("/{ride_id}/complete", response_model=RideResponse)
def complete_ride(
    ride_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the driver can complete this ride")
        
    ride.status = RideStatusEnum.COMPLETED
    db.commit()
    db.refresh(ride)
    return ride

@router.post("/{ride_id}/cancel", response_model=RideResponse)
def cancel_ride(
    ride_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the driver can cancel this ride")
        
    ride.status = RideStatusEnum.CANCELLED
    db.commit()
    db.refresh(ride)
    return ride
