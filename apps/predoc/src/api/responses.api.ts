import { apiClient } from './client';
import type {
  SubmitResponseRequest,
  SummaryResponse,
} from '../types/contracts';

export async function submitResponse(req: SubmitResponseRequest): Promise<SummaryResponse> {
  const { data } = await apiClient.post<SummaryResponse>('/responses', req);
  return data;
}

export async function getSummary(sessionId: string): Promise<SummaryResponse> {
  const { data } = await apiClient.get<SummaryResponse>(
    `/responses/${sessionId}/summary`,
  );
  return data;
}
