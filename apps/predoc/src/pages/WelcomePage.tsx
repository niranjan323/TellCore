import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, Stethoscope, WifiOff } from 'lucide-react';
import { MeshBackground } from '../components/ui/MeshBackground';
import { WordReveal } from '../components/ui/WordReveal';
import { Spinner } from '../components/ui/Spinner';
import { useMagnetic } from '../hooks/useMagnetic';
import { authGoogle, authGuest } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// The `window.google` ambient type is declared once in AuthPage.tsx and merged
// across the project — keep it single-source to avoid duplicate declarations.

export function WelcomePage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const deviceToken = useAuthStore((s) => s.deviceToken);
  const magneticRef = useMagnetic<HTMLButtonElement>(0.18);

  const [loadingGuest, setLoadingGuest] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setError(null);
    if (!GOOGLE_CLIENT_ID || !window.google) {
      setError('Google sign-in is not configured yet — continue as guest for now.');
      return;
    }
    setLoadingGoogle(true);
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          const res = await authGoogle(credential);
          setAuth(res);
          navigate('/start', { replace: true });
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
      navigate('/start', { replace: true });
    } catch {
      setError("We couldn't start a guest session. Please check your connection.");
    } finally {
      setLoadingGuest(false);
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface">
      <MeshBackground variant="aurora" />

      <header className="relative z-10 mx-auto flex w-full max-w-page items-center justify-between px-5 py-5 md:px-10 md:py-7">
        <span className="inline-flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-surface shadow-sm">
            <Stethoscope size={18} aria-hidden />
          </span>
          <span className="font-semibold tracking-tight text-text-primary">PreDoc</span>
        </span>
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs font-medium text-text-secondary backdrop-blur md:inline-flex">
          <Sparkles className="h-3 w-3 text-primary" aria-hidden />
          Calmer doctor visits
        </span>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-page items-center gap-12 px-5 pb-24 pt-6 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:px-10 md:pb-20 md:pt-10 lg:gap-24">
        {/* Editorial headline */}
        <section className="text-text-primary">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-light/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-primary-dark">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Before your visit
          </p>

          <h1 className="text-[44px] font-semibold leading-[1.02] tracking-tight md:text-[68px] lg:text-[78px]">
            <WordReveal text="You know" as="span" className="block" />
            <WordReveal
              text="something is wrong."
              as="span"
              className="block"
              delay={0.18}
            />
            <WordReveal
              text="We help you explain it."
              as="span"
              className="block text-primary-dark"
              delay={0.42}
            />
          </h1>

          <p className="mt-7 max-w-md text-[15px] leading-relaxed text-text-secondary md:text-base">
            Five quiet minutes. A few simple questions. PreDoc organises the way
            you&apos;re feeling into a clear summary your doctor can read in seconds.
          </p>

          <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              No account needed
            </li>
            <li className="inline-flex items-center gap-1.5">
              <WifiOff className="h-4 w-4 text-primary" aria-hidden />
              Works offline
            </li>
            <li className="hidden text-text-hint md:inline">
              &middot; Your data never leaves your device unless you save it.
            </li>
          </ul>
        </section>

        {/* Glass auth card */}
        <section className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[28px] bg-primary/15 blur-2xl md:-inset-8" aria-hidden />
          <div className="glass-card relative overflow-hidden rounded-[24px] p-7 md:p-9">
            {/* Subtle breathing ring metaphor in the corner */}
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary-light animate-ring-breathe"
              aria-hidden
            />

            <div className="relative">
              <p className="font-medium text-text-primary">Begin your visit prep</p>
              <p className="mt-1 text-sm text-text-secondary">
                Sign in to save and revisit your summaries — or jump in as a guest.
              </p>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-text-primary"
                >
                  {error}
                </p>
              )}

              <div className="mt-7 flex flex-col gap-3">
                <button
                  ref={magneticRef}
                  type="button"
                  onClick={handleGoogle}
                  disabled={loadingGoogle}
                  className="btn-shimmer relative inline-flex min-h-[52px] items-center justify-center gap-2 overflow-hidden rounded-md bg-primary px-6 py-3 text-[15px] font-medium text-surface shadow-[0_10px_25px_-12px_rgba(15,110,86,0.55)] transition-colors duration-150 hover:bg-primary-dark active:bg-primary-dark disabled:opacity-50"
                >
                  {loadingGoogle ? (
                    <Spinner size="sm" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                      <path
                        d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62Z"
                        fill="#ffffff"
                      />
                      <path
                        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.54-1.83.86-3.06.86-2.35 0-4.34-1.58-5.05-3.71H.92v2.33A9 9 0 0 0 9 18Z"
                        fill="#ffffff"
                        opacity="0.92"
                      />
                      <path
                        d="M3.95 10.71A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.71V4.96H.92A9 9 0 0 0 0 9c0 1.45.35 2.83.92 4.04l3.03-2.33Z"
                        fill="#ffffff"
                        opacity="0.78"
                      />
                      <path
                        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .92 4.96l3.03 2.33C4.66 5.16 6.65 3.58 9 3.58Z"
                        fill="#ffffff"
                        opacity="0.65"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuest}
                  disabled={loadingGuest}
                  className="group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md border border-border bg-surface/60 px-6 py-3 text-[15px] font-medium text-text-primary transition-colors duration-150 hover:bg-surface disabled:opacity-50"
                >
                  {loadingGuest ? <Spinner size="sm" /> : null}
                  Continue as guest
                  <ArrowRight
                    className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </button>
              </div>

              <p className="mt-5 text-center text-xs text-text-hint">
                By continuing, you agree to keep your symptoms in your own words.
                PreDoc never diagnoses.
              </p>
            </div>
          </div>

          {/* Decorative side caption — desktop only */}
          <p className="mt-5 hidden text-center font-medium text-text-hint md:block">
            Used quietly. Read clearly. Forgotten politely.
          </p>
        </section>
      </main>

      {/* Bottom marquee of trust strip */}
      <footer className="relative z-10 border-t border-border/60 bg-surface/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-page items-center justify-between gap-4 px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-text-hint md:px-10">
          <span>v1 · Calm Green</span>
          <span className="hidden md:inline">
            One thing at a time · Tap to select · Five minutes
          </span>
          <span>Designed for the anxious morning</span>
        </div>
      </footer>
    </div>
  );
}
