import { apiClient } from './client';
import type { ApiResponse } from '../types/common';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', payload);
  return data.data;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', payload);
  return data.data;
}
