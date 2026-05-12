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
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="flex items-center justify-between px-5 py-4">
        <Logo size="sm" />
        <button
          type="button"
          onClick={skip}
          className="text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          Skip
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-12 text-center">
        <div className="mb-10 flex h-40 w-40 items-center justify-center rounded-full bg-primary-light text-primary-dark md:h-48 md:w-48">
          <Icon className="h-16 w-16 md:h-20 md:w-20" strokeWidth={1.4} aria-hidden />
        </div>
        <h1 className="font-display text-[28px] font-semibold leading-tight text-text-primary md:text-[34px]">
          {STEPS[step].headline}
        </h1>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-text-secondary md:text-base">
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
