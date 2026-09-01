import { apiClient } from './client';
import type { UserResponse } from '../types/contracts';

export async function getMe(): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>('/users/me');
  return data;
}

export async function updatePrivacy(isProfilePublic: boolean): Promise<void> {
  await apiClient.patch('/users/me/privacy', { isProfilePublic });
}
