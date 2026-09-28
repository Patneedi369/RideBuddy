import pytest
from app.main import app
from fastapi.testclient import TestClient

def test_full_ride_buddy_workflow(client: TestClient):
    # 1. Driver Auth (Female)
    res = client.post("/api/v1/auth/send-otp", json={"phone_number": "+919876543210"})
    assert res.status_code == 200
    
    res = client.post("/api/v1/auth/verify-otp", json={"phone_number": "+919876543210", "otp_code": "482169"})
    assert res.status_code == 200
    driver_token = res.json()["access_token"]
    driver_headers = {"Authorization": f"Bearer {driver_token}"}

    # 2. Driver Profile Creation
    res = client.post("/api/v1/users/me/profile", headers=driver_headers, json={
        "name": "Ananya Driver",
        "gender": "female"
    })
    assert res.status_code == 200
    assert res.json()["name"] == "Ananya Driver"
    assert res.json()["gender"] == "female"

    # 3. Add Vehicle
    res = client.post("/api/v1/vehicles", headers=driver_headers, json={
        "vehicle_type": "car",
        "model": "Honda City",
        "registration_number": "AP 39 AB 1234",
        "capacity": 3,
        "mileage_kml": 15.0
    })
    assert res.status_code == 200
    vehicle_id = res.json()["id"]

    # 4. Create Women-Only Ride (Kakinada -> Rajahmundry)
    res = client.post("/api/v1/rides", headers=driver_headers, json={
        "vehicle_id": vehicle_id,
        "origin_name": "Kakinada",
        "origin_lat": 16.9891,
        "origin_lng": 82.2475,
        "destination_name": "Rajahmundry",
        "destination_lat": 17.0005,
        "destination_lng": 81.8040,
        "departure_time": "2026-09-29T08:00:00Z",
        "travel_preference": "women_only",
        "total_seats": 2,
        "waypoints": [
            {"name": "Samalkota", "lat": 17.0500, "lng": 82.1667, "order": 1}
        ]
    })
    assert res.status_code == 200
    ride_id = res.json()["id"]

    # 5. Passenger Auth (Female)
    res = client.post("/api/v1/auth/verify-otp", json={"phone_number": "+919123456789", "otp_code": "482169"})
    passenger_token = res.json()["access_token"]
    passenger_headers = {"Authorization": f"Bearer {passenger_token}"}

    client.post("/api/v1/users/me/profile", headers=passenger_headers, json={
        "name": "Priya Passenger",
        "gender": "female"
    })

    # 6. Passenger Searches Ride (Samalkota -> Rajahmundry)
    res = client.get("/api/v1/rides/search", headers=passenger_headers, params={
        "origin_lat": 17.0500,
        "origin_lng": 82.1667,
        "destination_lat": 17.0005,
        "destination_lng": 81.8040,
        "travel_preference": "women_only"
    })
    assert res.status_code == 200
    search_results = res.json()
    assert len(search_results) == 1
    assert search_results[0]["ride"]["id"] == ride_id
    assert search_results[0]["route_match_score"] >= 80

    # 7. Passenger Requests Seat
    res = client.post(f"/api/v1/rides/{ride_id}/requests", headers=passenger_headers, json={
        "pickup_name": "Samalkota Junction",
        "pickup_lat": 17.0500,
        "pickup_lng": 82.1667,
        "drop_name": "Rajahmundry Main",
        "drop_lat": 17.0005,
        "drop_lng": 81.8040,
        "seats_requested": 1
    })
    assert res.status_code == 200
    request_id = res.json()["id"]

    # 8. Driver Accepts Request
    res = client.post(f"/api/v1/requests/{request_id}/accept", headers=driver_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "ACCEPTED"

    # Verify seats updated
    res = client.get(f"/api/v1/rides/{ride_id}")
    assert res.json()["available_seats"] == 1

    # 9. Driver Starts Ride
    res = client.post(f"/api/v1/rides/{ride_id}/start", headers=driver_headers)
    assert res.json()["status"] == "IN_PROGRESS"

    # 10. Driver Completes Ride
    res = client.post(f"/api/v1/rides/{ride_id}/complete", headers=driver_headers)
    assert res.json()["status"] == "COMPLETED"

    # 11. Rate Each Other
    res = client.post(f"/api/v1/rides/{ride_id}/ratings", headers=passenger_headers, json={
        "reviewee_id": res.json()["driver_id"],
        "score": 5,
        "comment": "Great driving and super friendly!"
    })
    assert res.status_code == 200
    assert res.json()["score"] == 5
