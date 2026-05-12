import { useQuery } from '@tanstack/react-query';
import { getDefaultFormSet } from '../api/forms.api';
import { useAuthStore } from '../store/authStore';
import { fallbackPrompt } from '../data/storyFixtures';
import type { DailyPrompt } from '../types/contracts';

const PRODUCT_SLUG = import.meta.env.VITE_PRODUCT_SLUG ?? 'theuntold';

/**
 * Today's prompt comes from the backend `daily-prompt` FormSet intro.
 * Falls back to a fixture if the backend isn't reachable, so the dashboard
 * never breaks mid-read.
 */
export function usePrompt(language = 'en') {
  const accessToken = useAuthStore((s) => s.accessToken);
  const query = useQuery({
    queryKey: ['prompt', PRODUCT_SLUG, language],
    queryFn: async () => {
      const form = await getDefaultFormSet(PRODUCT_SLUG, language);
      const todayLabel = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      const prompt: DailyPrompt = {
        key: form.formSetId,
        question: form.intro?.body ?? fallbackPrompt.question,
        helper: form.intro?.subtitle ?? fallbackPrompt.helper,
        dateLabel: todayLabel,
      };
      return { prompt, form };
    },
    enabled: !!accessToken,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const prompt: DailyPrompt = query.data?.prompt ?? {
    ...fallbackPrompt,
    dateLabel: new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  };

  return { prompt, formSet: query.data?.form ?? null, query };
}
