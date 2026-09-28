import math
from typing import List, Dict, Any, Tuple

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates the Great Circle distance between two points in km."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def distance_point_to_segment(p_lat: float, p_lng: float,
                               a_lat: float, a_lng: float,
                               b_lat: float, b_lng: float) -> Tuple[float, float]:
    """
    Finds the minimum distance from point P to segment AB, and the projection ratio t (0 <= t <= 1).
    Returns (distance_km, t).
    """
    # Simple planar approximation for short distances in km
    dx = (b_lng - a_lng) * math.cos(math.radians((a_lat + b_lat) / 2))
    dy = b_lat - a_lat
    
    if dx == 0 and dy == 0:
        return haversine_distance(p_lat, p_lng, a_lat, a_lng), 0.0
        
    px = (p_lng - a_lng) * math.cos(math.radians((a_lat + p_lat) / 2))
    py = p_lat - a_lat
    
    t = (px * dx + py * dy) / (dx * dx + dy * dy)
    t_clamped = max(0.0, min(1.0, t))
    
    proj_lat = a_lat + t_clamped * (b_lat - a_lat)
    proj_lng = a_lng + t_clamped * (b_lng - a_lng)
    
    dist = haversine_distance(p_lat, p_lng, proj_lat, proj_lng)
    return dist, t_clamped

def calculate_route_overlap(
    waypoints: List[Dict[str, Any]],  # Driver's list of points [{lat, lng}, ...]
    pickup_lat: float,
    pickup_lng: float,
    drop_lat: float,
    drop_lng: float
) -> Dict[str, Any]:
    """
    Calculates if passenger's route (pickup -> drop) overlaps driver's route (waypoints).
    Returns dict with match status, match percentage score, and distance.
    """
    if len(waypoints) < 2:
        return {"is_match": False, "match_score": 0, "segment_distance_km": 0.0}

    # Find closest segment & position for Pickup
    min_pickup_dist = float("inf")
    best_pickup_segment_idx = -1
    best_pickup_t = 0.0

    for i in range(len(waypoints) - 1):
        a = waypoints[i]
        b = waypoints[i+1]
        dist, t = distance_point_to_segment(pickup_lat, pickup_lng, a["lat"], a["lng"], b["lat"], b["lng"])
        if dist < min_pickup_dist:
            min_pickup_dist = dist
            best_pickup_segment_idx = i
            best_pickup_t = t

    # Find closest segment & position for Drop
    min_drop_dist = float("inf")
    best_drop_segment_idx = -1
    best_drop_t = 0.0

    for i in range(len(waypoints) - 1):
        a = waypoints[i]
        b = waypoints[i+1]
        dist, t = distance_point_to_segment(drop_lat, drop_lng, a["lat"], a["lng"], b["lat"], b["lng"])
        if dist < min_drop_dist:
            min_drop_dist = dist
            best_drop_segment_idx = i
            best_drop_t = t

    # Direction check: pickup index + position must come BEFORE drop index + position on driver path
    pickup_pos = best_pickup_segment_idx + best_pickup_t
    drop_pos = best_drop_segment_idx + best_drop_t

    if drop_pos <= pickup_pos:
        # Invalid direction (passenger drop is before pickup on driver's route)
        return {
            "is_match": False,
            "match_score": 0,
            "segment_distance_km": 0.0,
            "reason": "Drop-off is before pickup along the route"
        }

    # Max allowed deviation from driver's route (e.g. max 15 km away from route)
    MAX_DEVIATION_KM = 15.0
    if min_pickup_dist > MAX_DEVIATION_KM or min_drop_dist > MAX_DEVIATION_KM:
        return {
            "is_match": False,
            "match_score": 0,
            "segment_distance_km": 0.0,
            "reason": "Pickup or drop-off location is too far from driver route"
        }

    # Calculate passenger segment distance along route
    passenger_dist = haversine_distance(pickup_lat, pickup_lng, drop_lat, drop_lng)
    
    # Calculate match score based on deviation penalties
    # 100% minus 2% per km of pickup/drop deviation
    total_deviation = min_pickup_dist + min_drop_dist
    score = max(50, round(98 - (total_deviation * 2.5)))
    if score > 99:
        score = 99

    return {
        "is_match": True,
        "match_score": int(score),
        "segment_distance_km": round(passenger_dist, 1),
        "pickup_deviation_km": round(min_pickup_dist, 2),
        "drop_deviation_km": round(min_drop_dist, 2)
    }
