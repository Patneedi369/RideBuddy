import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationItem {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
}

// Preset popular Indian cities for instant search suggestions
const POPULAR_INDIAN_LOCATIONS: LocationItem[] = [
  { id: '1', name: 'Kakinada', description: 'Andhra Pradesh, India', lat: 16.9891, lng: 82.2475 },
  { id: '2', name: 'Samalkota', description: 'Kakinada District, Andhra Pradesh', lat: 17.0500, lng: 82.1667 },
  { id: '3', name: 'Rajahmundry', description: 'East Godavari, Andhra Pradesh', lat: 17.0005, lng: 81.8040 },
  { id: '4', name: 'Visakhapatnam', description: 'Andhra Pradesh, India', lat: 17.6868, lng: 83.2185 },
  { id: '5', name: 'Vijayawada', description: 'NTR District, Andhra Pradesh', lat: 16.5062, lng: 80.6480 },
  { id: '6', name: 'Hyderabad', description: 'Telangana, India', lat: 17.3850, lng: 78.4867 },
  { id: '7', name: 'Bengaluru', description: 'Karnataka, India', lat: 12.9716, lng: 77.5946 },
  { id: '8', name: 'Chennai', description: 'Tamil Nadu, India', lat: 13.0827, lng: 80.2707 },
];

class LocationService {
  /**
   * Search for locations in India using OpenStreetMap Photon/Nominatim geocoding API.
   * Fallback to local Indian city directory if offline or error.
   */
  async searchLocations(query: string): Promise<LocationItem[]> {
    if (!query || query.trim().length < 2) {
      return POPULAR_INDIAN_LOCATIONS;
    }

    const cleaned = query.trim().toLowerCase();

    try {
      // Use Photon API (Free geocoding server powered by OpenStreetMap, optimized for place autocomplete)
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleaned)}&limit=7&countrycode=in`;
      const response = await fetch(url, { headers: { 'User-Agent': 'RideBuddyApp/1.0' } });

      if (response.ok) {
        const data = await response.json();
        if (data && data.features && data.features.length > 0) {
          return data.features.map((item: any, idx: number) => {
            const props = item.properties || {};
            const coords = item.geometry?.coordinates || [0, 0];
            const name = props.name || props.street || props.city || cleaned;
            const parts = [props.street, props.district, props.city, props.state].filter(Boolean);
            const description = parts.join(', ') || 'India';

            return {
              id: `geo-${idx}-${coords[0]}`,
              name,
              description,
              lat: coords[1],
              lng: coords[0],
            };
          });
        }
      }
    } catch (error) {
      console.log('Online location search error, falling back to local dataset:', error);
    }

    // Local filter fallback
    return POPULAR_INDIAN_LOCATIONS.filter(
      (loc) => loc.name.toLowerCase().includes(cleaned) || loc.description.toLowerCase().includes(cleaned)
    );
  }

  /**
   * Gets current user location ONLY when explicitly requested by user.
   * Does NOT force location permissions or throw uncaught errors.
   */
  async getCurrentLocation(): Promise<LocationItem | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to human-readable address
      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
      let name = 'Current Location';
      let description = 'Nearby';

      if (reverse && reverse.length > 0) {
        const place = reverse[0];
        name = place.name || place.district || place.city || 'Current Location';
        description = [place.street, place.subregion || place.city, place.region].filter(Boolean).join(', ');
      }

      return {
        id: 'current-loc',
        name,
        description,
        lat: latitude,
        lng: longitude,
      };
    } catch (e) {
      console.log('Current location error:', e);
      return null;
    }
  }
}

export const locationService = new LocationService();
