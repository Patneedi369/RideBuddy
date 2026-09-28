import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

def get_auth_headers(client: TestClient, phone: str, name: str = "Test User", gender: str = "any"):
    res = client.post("/api/v1/auth/verify-otp", json={"phone_number": phone, "otp_code": "123456"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    client.post("/api/v1/users/me/profile", headers=headers, json={"name": name, "gender": gender})
    return headers

def test_scenario_a_no_rides(client: TestClient):
    headers = get_auth_headers(client, "+919999900001", "Passenger A")
    
    # 1. Search when 0 rides exist
    res = client.get("/api/v1/rides/search", headers=headers, params={
        "origin_lat": 17.0500,
        "origin_lng": 82.1667,
        "destination_lat": 17.0005,
        "destination_lng": 81.8040,
        "travel_date": "2026-09-29",
        "travel_time": "08:00 AM"
    })
    assert res.status_code == 200
    assert len(res.json()) == 0
    
    # 2. Verify upcoming rides is empty
    res_my_rides = client.get("/api/v1/rides/my/upcoming", headers=headers)
    assert res_my_rides.status_code == 200
    assert len(res_my_rides.json()) == 0

def test_scenario_b_search_does_not_create_ride(client: TestClient):
    headers = get_auth_headers(client, "+919999900002", "Passenger B")
    
    # Search multiple times
    for _ in range(3):
        res = client.get("/api/v1/rides/search", headers=headers, params={
            "origin_lat": 17.0500,
            "origin_lng": 82.1667,
            "destination_lat": 17.0005,
            "destination_lng": 81.8040,
            "travel_date": "2026-09-29",
            "travel_time": "08:00 AM"
        })
        assert res.status_code == 200
        
    # Check upcoming and history stay empty
    res_upcoming = client.get("/api/v1/rides/my/upcoming", headers=headers)
    assert len(res_upcoming.json()) == 0
    res_history = client.get("/api/v1/rides/my/history", headers=headers)
    assert len(res_history.json()) == 0

def test_scenario_c_real_matching_ride(client: TestClient):
    driver_headers = get_auth_headers(client, "+919999900003", "Driver C")
    
    # Add vehicle with required mileage_kml
    res_v = client.post("/api/v1/vehicles", headers=driver_headers, json={
        "vehicle_type": "car",
        "model": "Swift",
        "registration_number": "AP 05 XY 9999",
        "capacity": 4,
        "mileage_kml": 15.0
    })
    assert res_v.status_code == 200
    v_id = res_v.json()["id"]
    
    tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
    dept_datetime = f"{tomorrow}T08:00:00Z"
    
    # Create driver ride A -> B -> C -> D
    res_ride = client.post("/api/v1/rides", headers=driver_headers, json={
        "vehicle_id": v_id,
        "origin_name": "Kakinada",
        "origin_lat": 16.9891,
        "origin_lng": 82.2475,
        "destination_name": "Rajahmundry",
        "destination_lat": 17.0005,
        "destination_lng": 81.8040,
        "departure_time": dept_datetime,
        "total_seats": 3,
        "waypoints": [
            {"name": "Samalkota", "lat": 17.0500, "lng": 82.1667, "order": 1},
            {"name": "Peddapuram", "lat": 17.0784, "lng": 82.1378, "order": 2}
        ]
    })
    assert res_ride.status_code == 200
    
    passenger_headers = get_auth_headers(client, "+919999900004", "Passenger C")
    
    # Search B -> C
    res = client.get("/api/v1/rides/search", headers=passenger_headers, params={
        "origin_lat": 17.0500,
        "origin_lng": 82.1667,
        "destination_lat": 17.0784,
        "destination_lng": 82.1378,
        "travel_date": tomorrow,
        "travel_time": "08:00 AM"
    })
    
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 1
    assert results[0]["route_match_score"] > 0

def test_scenario_d_wrong_date(client: TestClient):
    driver_headers = get_auth_headers(client, "+919999900005", "Driver D")
    res_v = client.post("/api/v1/vehicles", headers=driver_headers, json={
        "vehicle_type": "car", "model": "i20", "registration_number": "AP 05 D 1234", "capacity": 3, "mileage_kml": 15.0
    })
    v_id = res_v.json()["id"]
    
    tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
    day_after = (datetime.now(timezone.utc) + timedelta(days=2)).strftime("%Y-%m-%d")
    
    client.post("/api/v1/rides", headers=driver_headers, json={
        "vehicle_id": v_id,
        "origin_name": "Kakinada", "origin_lat": 16.9891, "origin_lng": 82.2475,
        "destination_name": "Rajahmundry", "destination_lat": 17.0005, "destination_lng": 81.8040,
        "departure_time": f"{tomorrow}T08:00:00Z",
        "total_seats": 3
    })
    
    passenger_headers = get_auth_headers(client, "+919999900006", "Passenger D")
    
    # Search on day_after
    res = client.get("/api/v1/rides/search", headers=passenger_headers, params={
        "origin_lat": 16.9891, "origin_lng": 82.2475,
        "destination_lat": 17.0005, "destination_lng": 81.8040,
        "travel_date": day_after,
        "travel_time": "08:00 AM"
    })
    
    assert res.status_code == 200
    assert len(res.json()) == 0

def test_scenario_e_wrong_time(client: TestClient):
    driver_headers = get_auth_headers(client, "+919999900007", "Driver E")
    res_v = client.post("/api/v1/vehicles", headers=driver_headers, json={
        "vehicle_type": "car", "model": "Baleno", "registration_number": "AP 05 E 1234", "capacity": 3, "mileage_kml": 15.0
    })
    v_id = res_v.json()["id"]
    
    tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
    
    client.post("/api/v1/rides", headers=driver_headers, json={
        "vehicle_id": v_id,
        "origin_name": "Kakinada", "origin_lat": 16.9891, "origin_lng": 82.2475,
        "destination_name": "Rajahmundry", "destination_lat": 17.0005, "destination_lng": 81.8040,
        "departure_time": f"{tomorrow}T08:00:00Z", # 8:00 AM
        "total_seats": 3
    })
    
    passenger_headers = get_auth_headers(client, "+919999900008", "Passenger E")
    
    # Search at 06:00 PM (10 hours later - outside +/- 4h window)
    res = client.get("/api/v1/rides/search", headers=passenger_headers, params={
        "origin_lat": 16.9891, "origin_lng": 82.2475,
        "destination_lat": 17.0005, "destination_lng": 81.8040,
        "travel_date": tomorrow,
        "travel_time": "06:00 PM"
    })
    
    assert res.status_code == 200
    assert len(res.json()) == 0

def test_scenario_f_request_flow_pending_to_accepted(client: TestClient):
    driver_headers = get_auth_headers(client, "+919999900009", "Driver F")
    res_v = client.post("/api/v1/vehicles", headers=driver_headers, json={
        "vehicle_type": "car", "model": "Creta", "registration_number": "AP 05 F 1234", "capacity": 3, "mileage_kml": 15.0
    })
    v_id = res_v.json()["id"]
    
    tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
    
    res_ride = client.post("/api/v1/rides", headers=driver_headers, json={
        "vehicle_id": v_id,
        "origin_name": "Kakinada", "origin_lat": 16.9891, "origin_lng": 82.2475,
        "destination_name": "Rajahmundry", "destination_lat": 17.0005, "destination_lng": 81.8040,
        "departure_time": f"{tomorrow}T08:00:00Z",
        "total_seats": 3
    })
    ride_id = res_ride.json()["id"]
    
    passenger_headers = get_auth_headers(client, "+919999900010", "Passenger F")
    
    # Request seat
    res_req = client.post(f"/api/v1/rides/{ride_id}/requests", headers=passenger_headers, json={
        "pickup_name": "Kakinada Town", "pickup_lat": 16.9891, "pickup_lng": 82.2475,
        "drop_name": "Rajahmundry Central", "drop_lat": 17.0005, "drop_lng": 81.8040,
        "seats_requested": 1
    })
    assert res_req.status_code == 200
    req_id = res_req.json()["id"]
    assert res_req.json()["status"] == "PENDING"
    
    # Passenger upcoming rides before accept MUST be 0
    res_upcoming = client.get("/api/v1/rides/my/upcoming", headers=passenger_headers)
    assert len(res_upcoming.json()) == 0
    
    # Driver accepts request
    res_accept = client.post(f"/api/v1/requests/{req_id}/accept", headers=driver_headers)
    assert res_accept.status_code == 200
    assert res_accept.json()["status"] == "ACCEPTED"
    
    # Passenger upcoming rides after accept MUST contain the ride
    res_upcoming_after = client.get("/api/v1/rides/my/upcoming", headers=passenger_headers)
    assert len(res_upcoming_after.json()) == 1
    assert res_upcoming_after.json()[0]["id"] == ride_id

def test_scenario_g_no_fake_home_card(client: TestClient):
    headers = get_auth_headers(client, "+919999900011", "New User G")
    res_upcoming = client.get("/api/v1/rides/my/upcoming", headers=headers)
    assert res_upcoming.status_code == 200
    assert len(res_upcoming.json()) == 0
