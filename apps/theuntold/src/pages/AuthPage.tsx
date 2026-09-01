import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { authGoogle, authGuest } from '../api/auth.api';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';
import { useAuthStore } from '../store/authStore';

export function AuthPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const deviceToken = useAuthStore((s) => s.deviceToken);
  const { signIn, fallbackRef } = useGoogleSignIn();
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setError(null);
    setLoadingGoogle(true);
    const failure = await signIn(async (credential) => {
      try {
        const res = await authGoogle(credential);
        setAuth(res);
        navigate('/', { replace: true });
      } catch {
        setError("That didn't work. Please try again in a moment.");
      }
    });
    setLoadingGoogle(false);
    if (failure) setError(failure);
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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 mesh-warm opacity-90" />
        <div className="absolute inset-0 bg-paper-grain opacity-80" />
        <div className="absolute inset-0 bg-noise opacity-50 mix-blend-multiply" />
      </div>

      <div className="editorial-card animate-page relative w-full max-w-sm overflow-hidden rounded-[22px] p-8 shadow-md">
        <span className="tape" style={{ top: -10, left: 36, transform: 'rotate(-6deg)' }} aria-hidden />

        <div className="relative mb-8 flex flex-col items-center text-center">
          <Logo size="lg" />
          <h1 className="mt-6 font-display text-2xl font-semibold text-text-primary md:text-3xl">
            Welcome home.
          </h1>
          <p className="mt-2 font-handwritten text-lg text-text-secondary">
            <span className="handline">Your stories begin here.</span>
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-primary-light px-3 py-2 text-sm text-primary-dark"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Button
            label="Continue with Google"
            variant="gold"
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
          <div ref={fallbackRef} hidden className="flex justify-center pt-1" />
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-text-hint">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          <span>Your stories are yours. Always.</span>
        </div>
      </div>
    </div>
  );
}
