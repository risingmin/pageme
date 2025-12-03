import apiClient from './client';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/User';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', credentials);
    return response.data;
  },
};

export default authApi;
