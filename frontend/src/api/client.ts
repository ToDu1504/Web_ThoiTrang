import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { getGuestSessionId } from '../lib/sessionId';
import type { AuthResponse } from '../types/auth';
import type { ApiResponse } from '../types/common';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  } else if (config.url?.startsWith('/api/cart')) {
    config.headers.set('X-Session-Id', getGuestSessionId());
  }
  return config;
});

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshingPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) {
    throw new Error('Không có refresh token');
  }

  const response = await axios.post<ApiResponse<AuthResponse>>(`${baseURL}/api/auth/refresh-token`, {
    refreshToken,
  });
  const auth = response.data.data;
  useAuthStore.getState().updateTokens({ accessToken: auth.accessToken, refreshToken: auth.refreshToken });
  return auth.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const isAuthEndpoint = originalRequest?.url?.includes('/api/auth/');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        if (!refreshingPromise) {
          refreshingPromise = refreshAccessToken().finally(() => {
            refreshingPromise = null;
          });
        }
        const newAccessToken = await refreshingPromise;
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
