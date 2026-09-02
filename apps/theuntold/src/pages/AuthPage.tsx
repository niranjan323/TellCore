import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import {
  authGoogle,
  authGuest,
  authLogin,
  authRegister,
  fetchAuthMethods,
} from '../api/auth.api';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';
import { useAuthStore } from '../store/authStore';

const FORM_ERRORS: Record<string, string> = {
  invalid_credentials: 'Email or password is wrong.',
  email_in_use: 'This email already has an account — sign in instead.',
  email_uses_google: 'This email signs in with Google — use the Google button.',
  weak_password: 'Password needs at least 8 characters.',
  invalid_email: "That doesn't look like an email address.",
};

export function AuthPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const deviceToken = useAuthStore((s) => s.deviceToken);
  const { signIn, fallbackRef } = useGoogleSignIn();

  const methods = useQuery({ queryKey: ['auth-methods'], queryFn: fetchAuthMethods });
  const enabled = (m: string) => (methods.data ?? ['guest']).includes(m as never);

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function finish(res: Parameters<typeof setAuth>[0]) {
    setAuth(res);
    navigate('/', { replace: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoadingForm(true);
    try {
      const res =
        mode === 'register'
          ? await authRegister(email, password, name || undefined)
          : await authLogin(email, password);
      finish(res);
    } catch (err) {
      const code = isAxiosError(err) ? err.response?.data?.error : undefined;
      setError(FORM_ERRORS[code ?? ''] ?? "That didn't work. Please try again in a moment.");
    } finally {
      setLoadingForm(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoadingGoogle(true);
    const failure = await signIn(async (credential) => {
      try {
        finish(await authGoogle(credential));
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
      finish(await authGuest(deviceToken));
    } catch {
      setError("We couldn't start a guest session. Check your connection.");
    } finally {
      setLoadingGuest(false);
    }
  }

  const inputClass =
    'w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-hint focus:border-primary';

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 mesh-warm opacity-90" />
        <div className="absolute inset-0 bg-paper-grain opacity-80" />
        <div className="absolute inset-0 bg-noise opacity-50 mix-blend-multiply" />
      </div>

      <div className="editorial-card animate-page relative w-full max-w-sm overflow-hidden rounded-[22px] p-8 shadow-md">
        <span className="tape" style={{ top: -10, left: 36, transform: 'rotate(-6deg)' }} aria-hidden />

        <div className="relative mb-6 flex flex-col items-center text-center">
          <Logo size="lg" />
          <h1 className="mt-5 font-display text-2xl font-semibold text-text-primary md:text-3xl">
            {mode === 'register' ? 'Begin your library.' : 'Welcome home.'}
          </h1>
          <p className="mt-2 font-handwritten text-lg text-text-secondary">
            <span className="handline">Your stories begin here.</span>
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-md bg-primary-light px-3 py-2 text-sm text-primary-dark">
            {error}
          </p>
        )}

        {enabled('password') && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'register' && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className={inputClass}
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className={inputClass}
            />
            <input
              type="password"
              required
              minLength={mode === 'register' ? 8 : 1}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Password (8+ characters)' : 'Password'}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              className={inputClass}
            />
            <Button
              label={mode === 'register' ? 'Create account' : 'Sign in'}
              variant="primary"
              loading={loadingForm}
              type="submit"
              fullWidth
            />
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === 'register' ? 'signin' : 'register'));
                setError(null);
              }}
              className="text-center text-sm text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
            >
              {mode === 'register' ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </button>
          </form>
        )}

        {(enabled('google') || enabled('guest')) && enabled('password') && (
          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-text-hint">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {enabled('google') && (
            <Button
              label="Continue with Google"
              variant="gold"
              loading={loadingGoogle}
              onClick={handleGoogle}
              fullWidth
            />
          )}
          {enabled('guest') && (
            <Button
              label="Continue as guest"
              variant="ghost"
              loading={loadingGuest}
              onClick={handleGuest}
              fullWidth
            />
          )}
          <div ref={fallbackRef} hidden className="flex justify-center pt-1" />
        </div>

        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-text-hint">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          <span>Your stories are yours. Always.</span>
        </div>
      </div>
    </div>
  );
}
