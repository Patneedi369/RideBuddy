from app.services.petrol_calculator import calculate_estimated_petrol_share

def test_petrol_calculator_car():
    # 45 km segment in a car (15 km/L) @ ₹100/L with 3 total people (driver + 2 passengers)
    # Total fuel = 3 L * ₹100 = ₹300 total fuel cost
    # Share per person = ₹300 / 3 = ₹100
    share = calculate_estimated_petrol_share(
        distance_km=45.0,
        vehicle_type="car",
        mileage_kml=15.0,
        fuel_price_per_liter=100.0,
        number_of_people=3
    )
    assert share == 100.0

def test_petrol_calculator_bike():
    # 40 km segment on a bike (40 km/L) @ ₹100/L with 2 total people (driver + 1 passenger)
    # Total fuel = 1 L * ₹100 = ₹100
    # Share per person = ₹100 / 2 = ₹50
    share = calculate_estimated_petrol_share(
        distance_km=40.0,
        vehicle_type="bike",
        mileage_kml=40.0,
        fuel_price_per_liter=100.0,
        number_of_people=2
    )
    assert share == 50.0
