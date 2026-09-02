import { apiClient } from './client';
import type { AuthMethod, AuthResponse } from '../types/contracts';

export async function authGuest(deviceToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/guest', { deviceToken });
  return data;
}

export async function authGoogle(idToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/google', { idToken });
  return data;
}

export async function authRegister(email: string, password: string, name?: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', { email, password, name });
  return data;
}

export async function authLogin(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

/** Which sign-in options to offer — decided by the backend (Settings auth.methods). */
export async function fetchAuthMethods(): Promise<AuthMethod[]> {
  try {
    const { data } = await apiClient.get<{ methods: AuthMethod[] }>('/auth/methods');
    return data.methods;
  } catch {
    return ['guest']; // API unreachable → still let people in as guests
  }
}

export async function authRefresh(refreshToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}
