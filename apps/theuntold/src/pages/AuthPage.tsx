import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { authGoogle, authGuest } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function AuthPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const deviceToken = useAuthStore((s) => s.deviceToken);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setError(null);
    if (!GOOGLE_CLIENT_ID || !window.google) {
      setError('Google sign-in is not configured yet. Continue as guest for now.');
      return;
    }
    setLoadingGoogle(true);
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          const res = await authGoogle(credential);
          setAuth(res);
          navigate('/', { replace: true });
        } catch {
          setError("That didn't work. Please try again in a moment.");
        } finally {
          setLoadingGoogle(false);
        }
      },
    });
    window.google.accounts.id.prompt();
  }

  async function handleGuest() {
    setError(null);
    setLoadingGuest(true);
    try {
      const res = await authGuest(deviceToken);
      setAuth(res);
      navigate('/', { replace: true });
    } catch {
      setError("We couldn't start a guest session. Check your connection.");
    } finally {
      setLoadingGuest(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-surface px-4 py-10">
      <div className="absolute inset-0 bg-paper-grain opacity-70" aria-hidden />
      <div className="relative w-full max-w-sm animate-ink-fade rounded-lg border bg-surface p-8 shadow-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" />
          <h1 className="mt-6 font-display text-2xl font-semibold text-text-primary md:text-3xl">
            Welcome home.
          </h1>
          <p className="mt-2 font-handwritten text-lg text-text-secondary">
            Your stories begin here.
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-md bg-primary-light px-3 py-2 text-sm text-primary-dark">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Button
            label="Continue with Google"
            variant="secondary"
            loading={loadingGoogle}
            onClick={handleGoogle}
            fullWidth
          />
          <Button
            label="Continue as guest"
            variant="ghost"
            loading={loadingGuest}
            onClick={handleGuest}
            fullWidth
          />
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-text-hint">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          <span>Your stories are yours. Always.</span>
        </div>
      </div>
    </div>
  );
}
