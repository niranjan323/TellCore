import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import { acceptVaultInvite } from '../api/stories.api';

export const PENDING_INVITE_KEY = 'theuntold.pendingInvite';

const ERROR_MESSAGES: Record<string, string> = {
  invite_used: 'This invite link was already used.',
  invite_expired: 'This invite link has expired — ask for a new one.',
  invite_own: "That's your own vault — you're already in.",
  already_member: "You're already part of this vault.",
  not_found: "This invite link isn't valid.",
};

/** Landing page for vault share links: /vault/join/:token */
export function VaultJoinPage() {
  const { token: paramToken } = useParams<{ token: string }>();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(PENDING_INVITE_KEY);
    } catch {
      // ignore
    }
    const token = paramToken ?? stored;
    if (!token) {
      setResult({ ok: false, message: ERROR_MESSAGES.not_found });
      return;
    }

    (async () => {
      try {
        const accepted = await acceptVaultInvite(token);
        await queryClient.invalidateQueries({ queryKey: ['vault-stories'] });
        setResult({
          ok: true,
          message: `You're in. ${accepted.ownerName}'s family stories are now shared with you.`,
        });
      } catch (error: unknown) {
        const code =
          (error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? '';
        setResult({ ok: false, message: ERROR_MESSAGES[code] ?? "Couldn't accept this invite right now." });
      } finally {
        try {
          localStorage.removeItem(PENDING_INVITE_KEY);
        } catch {
          // ignore
        }
      }
    })();
  }, [paramToken, queryClient]);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-4">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 mesh-warm opacity-80" />
        <div className="absolute inset-0 bg-paper-grain opacity-70" />
      </div>

      <div className="editorial-card w-full max-w-md rounded-lg border p-10 text-center">
        {!result ? (
          <>
            <Spinner size="lg" />
            <p className="mt-4 font-display text-xl font-semibold text-text-primary">
              Opening the vault…
            </p>
          </>
        ) : (
          <>
            <Shield
              className={`mx-auto h-10 w-10 ${result.ok ? 'text-primary animate-warm-glow' : 'text-text-hint'}`}
              aria-hidden
            />
            <p className="mt-4 font-display text-xl font-semibold text-text-primary">
              {result.ok ? 'Welcome to the family vault' : "That didn't work"}
            </p>
            <p className="mt-2 text-sm text-text-secondary">{result.message}</p>
            <Link
              to={result.ok ? '/vault' : '/'}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-primary-dark"
            >
              {result.ok ? 'See shared stories' : 'Go home'}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
