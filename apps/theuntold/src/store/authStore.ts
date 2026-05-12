import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserType } from '../types/contracts';

const DEVICE_TOKEN_KEY = 'theuntold.deviceToken';

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
  onboardingComplete: boolean;
  setAuth: (auth: {
    accessToken: string;
    refreshToken: string;
    userType: UserType;
    userId: string;
    email: string | null;
  }) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setOnboardingComplete: (done: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userType: null,
      userId: null,
      email: null,
      deviceToken: readOrCreateDeviceToken(),
      onboardingComplete: false,
      setAuth: (auth) =>
        set({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          userType: auth.userType,
          userId: auth.userId,
          email: auth.email,
        }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setOnboardingComplete: (done) => set({ onboardingComplete: done }),
      clear: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userType: null,
          userId: null,
          email: null,
        }),
    }),
    {
      name: 'theuntold.auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userType: state.userType,
        userId: state.userId,
        email: state.email,
        deviceToken: state.deviceToken,
        onboardingComplete: state.onboardingComplete,
      }),
    },
  ),
);
