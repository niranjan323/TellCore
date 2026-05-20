import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Logo } from '../components/ui/Logo';
import { MeshBackground } from '../components/ui/MeshBackground';
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
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
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
          setError('Sign-in failed. Please try again.');
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
      setError("We couldn't start a guest session. Please check your connection.");
    } finally {
      setLoadingGuest(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <MeshBackground variant="breath" />
      <div className="glass-card animate-page relative w-full max-w-intro rounded-[24px] p-6 md:p-10">
        <span
          className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary-light animate-ring-breathe"
          aria-hidden
        />
        <div className="relative mb-8 flex flex-col items-center text-center">
          <Logo size="lg" />
          <h1 className="mt-6 text-2xl font-semibold leading-tight tracking-tight text-text-primary md:text-3xl">
            Welcome back.
          </h1>
          <p className="mt-2 font-medium text-text-secondary">
            You know something is wrong. We help you explain it.
          </p>
        </div>

        {error && (
          <div className="relative mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="relative flex flex-col gap-3">
          <Button
            label="Continue with Google"
            variant="primary"
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

        <div className="relative mt-8 flex items-center justify-center gap-2 text-xs text-text-hint">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
          <span>We never share your data.</span>
        </div>
      </div>
    </div>
  );
}
