import { apiClient } from './client';
import type { FormSetResponse } from '../types/contracts';

export async function getDefaultFormSet(
  slug: string,
  lang: string,
): Promise<FormSetResponse> {
  const { data } = await apiClient.get<FormSetResponse>(
    `/products/${slug}/forms/default`,
    { params: { lang } },
  );
  return data;
}

export async function getFormSet(
  slug: string,
  formSlug: string,
  lang: string,
): Promise<FormSetResponse> {
  const { data } = await apiClient.get<FormSetResponse>(
    `/products/${slug}/forms/${formSlug}`,
    { params: { lang } },
  );
  return data;
}
