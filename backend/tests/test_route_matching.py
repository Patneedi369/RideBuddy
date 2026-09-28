from app.services.route_matching import calculate_route_overlap, haversine_distance

def test_haversine_distance():
    # Distance between Kakinada (16.9891, 82.2475) and Rajahmundry (17.0005, 81.8040) is ~48 km
    dist = haversine_distance(16.9891, 82.2475, 17.0005, 81.8040)
    assert 40.0 <= dist <= 55.0

def test_route_overlap_exact_match():
    driver_waypoints = [
        {"name": "Kakinada", "lat": 16.9891, "lng": 82.2475},
        {"name": "Samalkota", "lat": 17.0500, "lng": 82.1667},
        {"name": "Rajahmundry", "lat": 17.0005, "lng": 81.8040}
    ]
    
    # Passenger going Samalkota -> Rajahmundry (Intermediate segment match!)
    res = calculate_route_overlap(
        waypoints=driver_waypoints,
        pickup_lat=17.0500, pickup_lng=82.1667,
        drop_lat=17.0005, drop_lng=81.8040
    )
    
    assert res["is_match"] is True
    assert res["match_score"] >= 90
    assert res["segment_distance_km"] > 0

def test_route_overlap_invalid_direction():
    driver_waypoints = [
        {"name": "Kakinada", "lat": 16.9891, "lng": 82.2475},
        {"name": "Samalkota", "lat": 17.0500, "lng": 82.1667},
        {"name": "Rajahmundry", "lat": 17.0005, "lng": 81.8040}
    ]
    
    # Passenger going Rajahmundry -> Samalkota (opposite direction)
    res = calculate_route_overlap(
        waypoints=driver_waypoints,
        pickup_lat=17.0005, pickup_lng=81.8040,
        drop_lat=17.0500, drop_lng=82.1667
    )
    
    assert res["is_match"] is False
