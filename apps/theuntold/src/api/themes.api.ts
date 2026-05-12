import { apiClient } from './client';
import type { ThemeResponse } from '../types/contracts';

export async function getActiveTheme(slug: string): Promise<ThemeResponse> {
  const { data } = await apiClient.get<ThemeResponse>(`/products/${slug}/themes/active`);
  return data;
}
