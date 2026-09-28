import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from '../services/api';
import { User, Vehicle, Gender } from '../types';

interface AuthContextType {
  user: User | null;
  vehicles: Vehicle[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  sendOtp: (phone: string) => Promise<{ is_existing_user: boolean }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ is_new_user: boolean; is_profile_complete: boolean }>;
  createProfile: (name: string, gender: Gender, profilePhoto?: string) => Promise<User>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  fetchVehicles: () => Promise<Vehicle[]>;
  addVehicle: (vehicleType: 'car' | 'bike', model: string, capacity: number, mileageKml: number, regNum?: string) => Promise<Vehicle>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async (): Promise<User | null> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        return null;
      }
      const me = await fetchWithAuth('/users/me');
      setUser(me);
      if (me.is_profile_complete) {
        const vList = await fetchWithAuth('/vehicles');
        setVehicles(vList);
      }
      return me;
    } catch (e) {
      console.log('Error refreshing profile:', e);
      setUser(null);
      await AsyncStorage.removeItem('auth_token');
      return null;
    }
  };

  useEffect(() => {
    refreshProfile().finally(() => setIsLoading(false));
  }, []);

  const sendOtp = async (phone: string) => {
    setPhoneNumber(phone);
    const res = await fetchWithAuth('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phone }),
    });
    return res;
  };

  const verifyOtp = async (phone: string, otp: string) => {
    const res = await fetchWithAuth('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phone, otp_code: otp }),
    });
    await AsyncStorage.setItem('auth_token', res.access_token);
    const updatedUser = await refreshProfile();
    return {
      is_new_user: res.is_new_user,
      is_profile_complete: updatedUser?.is_profile_complete ?? res.is_profile_complete,
    };
  };

  const createProfile = async (name: string, gender: Gender, profilePhoto?: string) => {
    const res = await fetchWithAuth('/users/me/profile', {
      method: 'POST',
      body: JSON.stringify({ name, gender, profile_photo: profilePhoto }),
    });
    setUser(res);
    return res;
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await fetchWithAuth('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    setUser(res);
    return res;
  };

  const fetchVehicles = async () => {
    const vList = await fetchWithAuth('/vehicles');
    setVehicles(vList);
    return vList;
  };

  const addVehicle = async (vehicleType: 'car' | 'bike', model: string, capacity: number, mileageKml: number, regNum?: string) => {
    const res = await fetchWithAuth('/vehicles', {
      method: 'POST',
      body: JSON.stringify({
        vehicle_type: vehicleType,
        model,
        registration_number: regNum || null,
        capacity,
        mileage_kml: mileageKml,
      }),
    });
    await fetchVehicles();
    return res;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setUser(null);
    setVehicles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        vehicles,
        isLoading,
        isAuthenticated: !!user,
        isProfileComplete: !!user?.is_profile_complete,
        phoneNumber,
        setPhoneNumber,
        sendOtp,
        verifyOtp,
        createProfile,
        updateProfile,
        fetchVehicles,
        addVehicle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
