import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Feather, Quote } from 'lucide-react';
import { WordReveal } from '../components/ui/WordReveal';
import { Spinner } from '../components/ui/Spinner';
import { useMagnetic } from '../hooks/useMagnetic';
import { authGoogle, authGuest } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { featuredStory, recentStoriesFixtures } from '../data/storyFixtures';

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

export function WelcomePage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const deviceToken = useAuthStore((s) => s.deviceToken);
  const onboardingDone = useAuthStore((s) => s.onboardingComplete);
  const magneticRef = useMagnetic<HTMLButtonElement>(0.16);

  const [loadingGuest, setLoadingGuest] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rotating editorial quote from a pool of fixture stories.
  const quotePool = useMemo(
    () => [featuredStory, ...recentStoriesFixtures].slice(0, 4),
    [],
  );
  const [quoteIdx, setQuoteIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setQuoteIdx((i) => (i + 1) % quotePool.length),
      6500,
    );
    return () => window.clearInterval(id);
  }, [quotePool.length]);
  const quote = quotePool[quoteIdx];

  function nextRouteAfterAuth() {
    return onboardingDone ? '/' : '/onboarding';
  }

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
          navigate(nextRouteAfterAuth(), { replace: true });
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
      navigate(nextRouteAfterAuth(), { replace: true });
    } catch {
      setError("We couldn't start a guest session. Check your connection.");
    } finally {
      setLoadingGuest(false);
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface">
      {/* Warm mesh + paper grain background */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 mesh-warm" />
        <div className="absolute inset-0 bg-paper-grain opacity-80" />
        <div className="absolute inset-0 bg-noise opacity-60 mix-blend-multiply" />
      </div>

      {/* Magazine masthead */}
      <header className="relative z-10 mx-auto flex w-full max-w-page items-center justify-between px-5 py-5 md:px-10 md:py-7">
        <span className="inline-flex items-center gap-2.5">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary-dark">
            <Feather size={18} strokeWidth={1.6} className="animate-candle-flicker" aria-hidden />
          </span>
          <span className="font-display text-lg tracking-tight text-text-primary">
            The<span className="italic text-primary-dark">Untold</span>
          </span>
        </span>
        <span className="hidden items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-text-secondary md:inline-flex">
          <span className="inline-block h-px w-8 bg-text-secondary/40" />
          Issue No. 01
          <span className="inline-block h-px w-8 bg-text-secondary/40" />
        </span>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-page items-center gap-12 px-5 pb-24 pt-2 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:px-10 md:pb-20 md:pt-6 lg:gap-24">
        {/* Cover-page typography */}
        <section className="relative">
          <p className="mb-6 inline-flex items-center gap-2 font-handwritten text-xl text-primary-dark md:text-2xl">
            <span className="inline-block h-px w-10 bg-primary-dark/60" />
            For the keeper of memory
          </p>

          <h1 className="font-display text-[52px] font-semibold leading-[0.98] tracking-tight text-text-primary md:text-[88px] lg:text-[104px]">
            <WordReveal text="Every life" as="span" className="block" />
            <WordReveal
              text="has a story"
              as="span"
              className="block italic text-primary-dark"
              delay={0.18}
            />
            <WordReveal
              text="worth keeping."
              as="span"
              className="block"
              delay={0.42}
            />
          </h1>

          <p className="mt-8 max-w-md text-[16px] leading-relaxed text-text-secondary md:text-[17px]">
            A quiet room for the everyday — a smell, a sound, a name almost
            forgotten. Tell one story today. Your family will read it long after.
          </p>

          {/* Rotating editorial quote */}
          <figure
            key={quote.id}
            className="animate-ink-bleed relative mt-10 max-w-md rounded-md border border-border/60 bg-surface/80 p-5 backdrop-blur"
          >
            <Quote className="absolute -top-3 left-4 h-6 w-6 text-primary opacity-70" aria-hidden />
            <blockquote className="font-display text-[19px] italic leading-snug text-text-primary md:text-[21px]">
              {quote.excerpt}
            </blockquote>
            <figcaption className="mt-3 flex items-center justify-between text-sm">
              <span className="font-handwritten text-lg text-text-secondary">
                — {quote.author.name}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-text-hint">
                Featured
              </span>
            </figcaption>
          </figure>
        </section>

        {/* Auth card — editorial paper */}
        <section className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[28px] bg-accent/20 blur-2xl" aria-hidden />
          <div className="editorial-card relative overflow-hidden rounded-[22px] p-7 md:p-9">
            {/* Decorative deckle edge / corner stamp */}
            <span className="pointer-events-none absolute right-5 top-5 inline-flex h-12 w-12 rotate-12 items-center justify-center rounded-full border border-accent/60 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-dark">
              Daily
              <br />
              Page
            </span>

            <p className="font-display text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
              Begin your library.
            </p>
            <p className="mt-1 font-handwritten text-lg text-text-secondary">
              One page a day. Five minutes is enough.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-md border border-primary/30 bg-primary-light/60 px-3 py-2 text-sm text-primary-dark"
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
                className="relative inline-flex min-h-[52px] items-center justify-center gap-2 overflow-hidden rounded-md bg-accent px-6 py-3 text-[15px] font-semibold text-primary-dark shadow-[0_18px_30px_-18px_rgba(122,79,48,0.5)] transition-colors hover:bg-accent/85 disabled:opacity-50"
              >
                {loadingGoogle ? <Spinner size="sm" /> : <GoogleMark />}
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handleGuest}
                disabled={loadingGuest}
                className="group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md border border-border bg-surface/70 px-6 py-3 text-[15px] font-medium text-text-primary transition-colors hover:bg-surface disabled:opacity-50"
              >
                {loadingGuest ? <Spinner size="sm" /> : null}
                Continue as guest
                <ArrowRight
                  className="h-4 w-4 text-primary-dark transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </button>

              <p className="pt-2 text-center text-xs text-text-hint">
                Your stories are yours. Always.
              </p>
            </div>

            {/* Hand-drawn underline accent */}
            <svg
              className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-50"
              width="180"
              height="14"
              viewBox="0 0 180 14"
              aria-hidden
            >
              <path
                d="M2 8 C 40 -2, 80 14, 120 6 S 175 4, 178 7"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="220"
                strokeDashoffset="220"
                style={{ animation: 'hand-draw 1.6s ease-out 0.6s forwards' }}
              />
            </svg>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/40 bg-surface/50 backdrop-blur">
        <div className="mx-auto flex w-full max-w-page items-center justify-between gap-4 px-5 py-3 text-[11px] uppercase tracking-[0.32em] text-text-hint md:px-10">
          <span>Volume 1</span>
          <span className="hidden md:inline">
            Voice or pen · One prompt · Kept in your hand
          </span>
          <span>Bound in paper</span>
        </div>
      </footer>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62Z"
        fill="#7a4f30"
      />
      <path
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.54-1.83.86-3.06.86-2.35 0-4.34-1.58-5.05-3.71H.92v2.33A9 9 0 0 0 9 18Z"
        fill="#7a4f30"
        opacity="0.82"
      />
      <path
        d="M3.95 10.71A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.71V4.96H.92A9 9 0 0 0 0 9c0 1.45.35 2.83.92 4.04l3.03-2.33Z"
        fill="#7a4f30"
        opacity="0.62"
      />
      <path
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .92 4.96l3.03 2.33C4.66 5.16 6.65 3.58 9 3.58Z"
        fill="#7a4f30"
        opacity="0.5"
      />
    </svg>
  );
}
