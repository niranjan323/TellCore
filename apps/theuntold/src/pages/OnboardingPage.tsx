import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mic, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { useAuthStore } from '../store/authStore';

interface OnboardingStep {
  headline: string;
  body: string;
  icon: typeof BookOpen;
}

const STEPS: OnboardingStep[] = [
  {
    headline: 'Stories that matter, kept forever.',
    body: "The everyday moments — a grandmother's hum, a father's sketch on a napkin — they vanish when no one writes them down. This is where you write them down.",
    icon: BookOpen,
  },
  {
    headline: 'Speak or write — one story a day.',
    body: 'A short prompt every morning. Tell it however you want — your voice, your handwriting, your time. Five minutes is enough.',
    icon: Mic,
  },
  {
    headline: 'Your family will thank you.',
    body: 'These pages are for them. The ones reading you in twenty years. The ones who never got to meet you. The ones who will know your laugh because of this.',
    icon: Users,
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const setDone = useAuthStore((s) => s.setOnboardingComplete);
  const [step, setStep] = useState(0);
  const Icon = STEPS[step].icon;

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    setDone(true);
    navigate('/', { replace: true });
  }

  function skip() {
    setDone(true);
    navigate('/', { replace: true });
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 mesh-warm opacity-90" />
        <div className="absolute inset-0 bg-paper-grain opacity-70" />
        <div className="absolute inset-0 bg-noise opacity-50 mix-blend-multiply" />
      </div>

      <header className="pt-safe relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
        <Logo size="sm" />
        <span className="hidden font-handwritten text-base text-text-secondary md:inline">
          Page {step + 1} of {STEPS.length}
        </span>
        <button
          type="button"
          onClick={skip}
          className="text-sm font-medium text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
        >
          Skip
        </button>
      </header>

      <main
        key={step}
        className="animate-ink-bleed relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 pb-12 text-center"
      >
        <div className="relative mb-10 flex h-44 w-44 items-center justify-center rounded-full bg-primary-light text-primary-dark md:h-56 md:w-56">
          <span className="absolute inset-0 rounded-full border border-primary-dark/20" />
          <span className="absolute inset-3 rounded-full border border-dashed border-primary-dark/30" />
          <Icon
            className="h-16 w-16 animate-flame md:h-20 md:w-20"
            strokeWidth={1.3}
            aria-hidden
          />
        </div>
        <p className="font-handwritten text-xl text-primary-dark md:text-2xl">
          Chapter {String(step + 1).padStart(2, '0')}
        </p>
        <h1 className="mt-2 font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-text-primary md:text-[48px]">
          <span className="handline">{STEPS[step].headline}</span>
        </h1>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-text-secondary md:text-[17px]">
          {STEPS[step].body}
        </p>
      </main>

      <footer className="mx-auto w-full max-w-md px-6 pb-10">
        <div className="mb-5 flex justify-center gap-2" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-primary' : 'w-3 bg-primary-light'
              }`}
            />
          ))}
        </div>
        <Button
          label={step < STEPS.length - 1 ? 'Next' : 'Begin'}
          variant="primary"
          onClick={next}
          fullWidth
        />
      </footer>
    </div>
  );
}
