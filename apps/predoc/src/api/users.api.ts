import { apiClient } from './client';
import type {
  SessionHistoryResponse,
  UserResponse,
} from '../types/contracts';

export async function getMe(): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>('/users/me');
  return data;
}

export async function getMySessions(): Promise<SessionHistoryResponse> {
  const { data } = await apiClient.get<SessionHistoryResponse>('/users/me/sessions');
  return data;
}

export async function deleteMe(): Promise<void> {
  await apiClient.delete('/users/me');
}
