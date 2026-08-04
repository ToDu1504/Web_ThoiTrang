import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from '../types/auth';

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: { user: UserResponse; accessToken: string; refreshToken: string }) => void;
  updateTokens: (data: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      updateTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'fashionshop-auth' },
  ),
);

export function hasRole(role: string): boolean {
  return useAuthStore.getState().user?.roles.includes(role) ?? false;
}
