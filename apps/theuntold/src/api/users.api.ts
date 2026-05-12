import { apiClient } from './client';
import type { UserResponse } from '../types/contracts';

export async function getMe(): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>('/users/me');
  return data;
}
