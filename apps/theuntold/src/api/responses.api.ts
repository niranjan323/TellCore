import { apiClient } from './client';
import type { SubmitResponseRequest, SummaryResponse } from '../types/contracts';

export async function submitResponse(req: SubmitResponseRequest): Promise<SummaryResponse> {
  const { data } = await apiClient.post<SummaryResponse>('/responses', req);
  return data;
}
