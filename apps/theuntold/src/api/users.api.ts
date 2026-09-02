import { apiClient } from './client';
import type { UserResponse } from '../types/contracts';

export async function getMe(): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>('/users/me');
  return data;
}

export async function updatePrivacy(isProfilePublic: boolean): Promise<void> {
  await apiClient.patch('/users/me/privacy', { isProfilePublic });
}

/** Soft-deletes the account and all its data (backend rule: never hard delete). */
export async function deleteMyAccount(): Promise<void> {
  await apiClient.delete('/users/me');
}
