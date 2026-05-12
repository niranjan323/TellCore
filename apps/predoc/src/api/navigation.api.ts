import { apiClient } from './client';
import type { NavigationResponse } from '../types/contracts';

export async function getNavigation(slug: string): Promise<NavigationResponse> {
  const { data } = await apiClient.get<NavigationResponse>(`/products/${slug}/navigation`);
  return data;
}
