import { useQuery } from '@tanstack/react-query';
import { getNavigation } from '../api/navigation.api';
import { useAuthStore } from '../store/authStore';

const PRODUCT_SLUG = import.meta.env.VITE_PRODUCT_SLUG ?? 'predoc';

export function useNavigation() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['navigation', PRODUCT_SLUG, !!accessToken],
    queryFn: () => getNavigation(PRODUCT_SLUG),
    enabled: !!accessToken,
    staleTime: 60 * 1000,
    retry: 1,
  });
}
