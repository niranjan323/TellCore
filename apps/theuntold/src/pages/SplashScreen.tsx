import { Logo } from '../components/ui/Logo';

interface SplashScreenProps {
  tagline?: string;
}

export function SplashScreen({ tagline = 'Every life has a story worth keeping.' }: SplashScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-surface px-6 text-center">
      <div className="animate-ink-fade">
        <Logo size="xl" />
      </div>
      <p className="animate-ink-fade font-handwritten text-xl text-text-secondary md:text-2xl">
        {tagline}
      </p>
    </div>
  );
}
