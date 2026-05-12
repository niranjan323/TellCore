import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserType } from '../types/contracts';

const DEVICE_TOKEN_KEY = 'predoc.deviceToken';

function readOrCreateDeviceToken(): string {
  try {
    const existing = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (existing) return existing;
  } catch {
    return crypto.randomUUID();
  }
  const fresh = crypto.randomUUID();
  try {
    localStorage.setItem(DEVICE_TOKEN_KEY, fresh);
  } catch {
    // ignore
  }
  return fresh;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userType: UserType | null;
  userId: string | null;
  email: string | null;
  deviceToken: string;
  setAuth: (auth: {
    accessToken: string;
    refreshToken: string;
    userType: UserType;
    userId: string;
    email: string | null;
  }) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      userType: null,
      userId: null,
      email: null,
      deviceToken: readOrCreateDeviceToken(),
      setAuth: (auth) =>
        set({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          userType: auth.userType,
          userId: auth.userId,
          email: auth.email,
        }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      clear: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userType: null,
          userId: null,
          email: null,
        }),
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'predoc.auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userType: state.userType,
        userId: state.userId,
        email: state.email,
        deviceToken: state.deviceToken,
      }),
    },
  ),
);
