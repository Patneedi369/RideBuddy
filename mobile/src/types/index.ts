export type Gender = 'female' | 'male' | 'other';
export type VehicleType = 'car' | 'bike';
export type TravelPreference = 'anyone' | 'women_only';
export type RideStatus = 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface User {
  id: number;
  phone_number: string;
  name?: string;
  gender?: Gender;
  profile_photo?: string;
  is_verified: boolean;
  is_profile_complete: boolean;
  created_at: string;
}

export interface Vehicle {
  id: number;
  user_id: number;
  vehicle_type: VehicleType;
  model: string;
  registration_number?: string;
  capacity: number;
  mileage_kml: number;
  created_at: string;
}

export interface Waypoint {
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export interface Ride {
  id: number;
  driver_id: number;
  vehicle_id: number;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  departure_time: string;
  estimated_arrival?: string;
  travel_preference: TravelPreference;
  total_seats: number;
  available_seats: number;
  status: RideStatus;
  waypoints_json?: Waypoint[];
  total_distance_km: number;
  fuel_price_per_liter: number;
  created_at: string;
  driver?: User;
  vehicle?: Vehicle;
}

export interface RideSearchResult {
  ride: Ride;
  route_match_score: number;
  segment_distance_km: number;
  estimated_petrol_share: number;
  pickup_name: string;
  drop_name: string;
}

export interface RideRequest {
  id: number;
  ride_id: number;
  passenger_id: number;
  pickup_name: string;
  pickup_lat: number;
  pickup_lng: number;
  drop_name: string;
  drop_lat: number;
  drop_lng: number;
  seats_requested: number;
  status: RequestStatus;
  distance_km: number;
  route_match_score: number;
  estimated_petrol_share: number;
  created_at: string;
  updated_at: string;
  passenger?: User;
  ride?: Ride;
}

export interface ChatMessage {
  id: number;
  ride_id: number;
  sender_id: number;
  message_text: string;
  created_at: string;
  sender?: User;
}

export interface Rating {
  id: number;
  ride_id: number;
  reviewer_id: number;
  reviewee_id: number;
  score: number;
  comment?: string;
  created_at: string;
  reviewer?: User;
}
