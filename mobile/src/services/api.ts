import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Standard local development IP / localhost
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || `${DEFAULT_HOST}/api/v1`).replace(/\/+$/, '');

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await AsyncStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.detail || 'Something went wrong. Please try again.';
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    return data;
  } catch (err: any) {
    if (err.message === 'Network request failed') {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw err;
  }
}
