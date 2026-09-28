from app.core.config import settings

def calculate_estimated_petrol_share(
    distance_km: float,
    vehicle_type: str = "car",
    mileage_kml: float = 15.0,
    fuel_price_per_liter: float = 102.50,
    number_of_people: int = 2  # Driver + 1 passenger default
) -> float:
    """
    Calculates estimated petrol share for a given route distance in INR (₹).
    
    Formula:
    Fuel Consumed (L) = distance_km / mileage_kml
    Total Fuel Cost (₹) = Fuel Consumed * fuel_price_per_liter
    Share per person (₹) = Total Fuel Cost / number_of_people
    """
    if distance_km <= 0:
        return 0.0

    # Ensure reasonable defaults if invalid input
    if mileage_kml <= 0:
        mileage_kml = settings.DEFAULT_BIKE_MILEAGE_KML if vehicle_type == "bike" else settings.DEFAULT_CAR_MILEAGE_KML
        
    if fuel_price_per_liter <= 0:
        fuel_price_per_liter = settings.DEFAULT_FUEL_PRICE_PER_LITER

    if number_of_people <= 0:
        number_of_people = 2  # Driver + 1 passenger minimum

    fuel_consumed = distance_km / mileage_kml
    total_cost = fuel_consumed * fuel_price_per_liter
    share_per_person = total_cost / number_of_people
    
    return round(share_per_person, 0)
