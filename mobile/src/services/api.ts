import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';
import { safeStorage } from './storage';

function getMetroHostIp(): string | null {
  try {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || (Constants as any)?.executionEnvironment;
    if (typeof hostUri === 'string') {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return match[1];
      }
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 3000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

let cachedWorkingHost: string | null = null;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await safeStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Build candidate backend URLs dynamically at request time
  const candidates: string[] = [];

  if (process.env.EXPO_PUBLIC_API_URL) {
    candidates.push(process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, ''));
  }

  const detectedIp = getMetroHostIp();
  if (detectedIp) {
    candidates.push(`http://${detectedIp}:8001`);
    candidates.push(`http://${detectedIp}:8000`);
  }

  if (Platform.OS === 'android') {
    candidates.push('http://10.0.2.2:8001');
    candidates.push('http://10.0.2.2:8000');
  }

  candidates.push('http://localhost:8001');
  candidates.push('http://localhost:8000');
  candidates.push('http://127.0.0.1:8001');
  candidates.push('http://127.0.0.1:8000');

  const uniqueHosts = Array.from(new Set(candidates));
  const hostsToTry = cachedWorkingHost
    ? [cachedWorkingHost, ...uniqueHosts.filter((h) => h !== cachedWorkingHost)]
    : uniqueHosts;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let response: Response | null = null;

  for (const host of hostsToTry) {
    const fullUrl = `${host}/api/v1${cleanEndpoint}`;
    try {
      response = await fetchWithTimeout(fullUrl, { ...options, headers }, 2500);
      if (response && (response.ok || response.status < 500)) {
        cachedWorkingHost = host;
        break;
      }
    } catch (err) {
      // Try next host candidate
    }
  }

  if (!response) {
    throw new Error('Cannot connect to backend server. Please make sure FastAPI backend is running.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.detail || 'Something went wrong. Please try again.';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  return data;
}
