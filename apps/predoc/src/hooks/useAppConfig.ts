import { useQuery } from '@tanstack/react-query';
import { getProductConfig } from '../api/config.api';

const PRODUCT_SLUG = import.meta.env.VITE_PRODUCT_SLUG ?? 'predoc';

export function useAppConfig() {
  return useQuery({
    queryKey: ['config', PRODUCT_SLUG],
    queryFn: () => getProductConfig(PRODUCT_SLUG),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
