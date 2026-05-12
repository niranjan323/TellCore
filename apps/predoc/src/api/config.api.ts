import { apiClient } from './client';
import type { ProductConfigResponse } from '../types/contracts';

export async function getProductConfig(slug: string): Promise<ProductConfigResponse> {
  const { data } = await apiClient.get<ProductConfigResponse>(`/products/${slug}/config`);
  return data;
}
