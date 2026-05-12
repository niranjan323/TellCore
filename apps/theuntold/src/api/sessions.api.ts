import { apiClient } from './client';
import type {
  CreateSessionRequest,
  SessionResponse,
  VoiceUploadResponse,
} from '../types/contracts';

export async function createSession(req: CreateSessionRequest): Promise<SessionResponse> {
  const { data } = await apiClient.post<SessionResponse>('/sessions', req);
  return data;
}

export async function uploadVoiceNote(
  sessionId: string,
  audio: Blob,
  filename = 'voice.webm',
): Promise<VoiceUploadResponse> {
  const form = new FormData();
  form.append('file', audio, filename);
  const { data } = await apiClient.post<VoiceUploadResponse>(
    `/sessions/${sessionId}/voice`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}
