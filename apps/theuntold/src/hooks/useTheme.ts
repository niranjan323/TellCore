import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActiveTheme } from '../api/themes.api';
import { injectTheme } from '../theme/injectTheme';

const PRODUCT_SLUG = import.meta.env.VITE_PRODUCT_SLUG ?? 'theuntold';

export function useTheme() {
  const query = useQuery({
    queryKey: ['theme', PRODUCT_SLUG, 'active'],
    queryFn: () => getActiveTheme(PRODUCT_SLUG),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  useEffect(() => {
    if (query.data?.variables) injectTheme(query.data.variables);
  }, [query.data]);
  return query;
}
