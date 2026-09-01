import { apiClient } from './client';
import type { AuthResponse } from '../types/contracts';

export async function authGuest(deviceToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/guest', { deviceToken });
  return data;
}

export async function authGoogle(idToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/google', { idToken });
  return data;
}

export async function authRefresh(refreshToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}
