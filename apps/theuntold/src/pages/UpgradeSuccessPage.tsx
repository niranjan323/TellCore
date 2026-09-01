import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Crown } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import { authRefresh } from '../api/auth.api';
import { fetchBillingStatus } from '../api/stories.api';
import { useAuthStore } from '../store/authStore';

/**
 * Stripe redirects here after checkout. The webhook flips the user to `paid`
 * shortly after, so we poll billing status, then refresh the JWT so the new
 * user_type claim (and paid navigation) take effect immediately.
 */
export function UpgradeSuccessPage() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<'checking' | 'done' | 'slow'>('checking');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let attempt = 0; attempt < 10; attempt++) {
        try {
          const status = await fetchBillingStatus();
          if (status.userType === 'paid') {
            const { refreshToken, setAuth, setTokens } = useAuthStore.getState();
            if (refreshToken) {
              try {
                const auth = await authRefresh(refreshToken);
                if (auth.userType) setAuth(auth);
                else setTokens(auth.accessToken, auth.refreshToken);
              } catch {
                // stale token still works until expiry; nav updates on next login
              }
            }
            await queryClient.invalidateQueries();
            if (!cancelled) setState('done');
            return;
          }
        } catch {
          // keep polling
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      if (!cancelled) setState('slow');
    })();
    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-4">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 mesh-warm opacity-80" />
        <div className="absolute inset-0 bg-paper-grain opacity-70" />
      </div>

      <div className="editorial-card w-full max-w-md rounded-lg border p-10 text-center">
        {state === 'checking' ? (
          <>
            <Spinner size="lg" />
            <p className="mt-4 font-display text-xl font-semibold text-text-primary">
              Confirming your membership…
            </p>
            <p className="mt-2 text-sm text-text-secondary">This takes a few seconds.</p>
          </>
        ) : (
          <>
            <Crown className="mx-auto h-10 w-10 text-accent animate-warm-glow" aria-hidden />
            <p className="mt-4 font-display text-2xl font-semibold text-text-primary">
              {state === 'done' ? 'Welcome to Premium' : 'Payment received'}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              {state === 'done'
                ? 'Every story is now open to you — full text, audio, and your family vault.'
                : "We're still confirming with Stripe. Your membership will activate within a minute."}
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-primary-dark"
            >
              Continue
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
