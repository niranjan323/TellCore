import { useQuery } from '@tanstack/react-query';
import { getDefaultFormSet } from '../api/forms.api';
import { useAuthStore } from '../store/authStore';

const PRODUCT_SLUG = import.meta.env.VITE_PRODUCT_SLUG ?? 'predoc';

export function useDefaultFormSet(language: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['form-set', PRODUCT_SLUG, 'default', language],
    queryFn: () => getDefaultFormSet(PRODUCT_SLUG, language),
    enabled: !!accessToken && !!language,
    staleTime: 60 * 1000,
  });
}
