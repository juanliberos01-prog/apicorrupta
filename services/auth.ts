import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptPassword } from '../utils/crypto';
import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  identificationNumber: string;
  role: 'BUYER' | 'SELLER';
}

export interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  identificationNumber?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  role: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    //const encryptedPassword = encryptPassword(payload.password);
    const encryptedPassword = '+rz+UN+Z4eHwyLLs5RXkLg==';
    const response = await api.post('/api/auth/login', {
      email: payload.email,
      encryptedPassword,
    });
    const data = response.data.data as AuthResponse;
    await AsyncStorage.setItem('authToken', data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(data));
    return data;
  },

  async register(payload: RegisterPayload): Promise<UserData> {
    const encryptedPassword = encryptPassword(payload.password);
    const response = await api.post('/api/auth/register', {
      email: payload.email,
      encryptedPassword,
      firstName: payload.firstName,
      lastName: payload.lastName,
      identificationNumber: payload.identificationNumber,
      role: payload.role,
    });
    return response.data.data as UserData;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  },

  async getStoredUser(): Promise<AuthResponse | null> {
    const stored = await AsyncStorage.getItem('userData');
    return stored ? JSON.parse(stored) : null;
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('authToken');
  },
};