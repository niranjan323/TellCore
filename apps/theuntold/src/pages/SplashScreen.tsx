import { Feather } from 'lucide-react';

interface SplashScreenProps {
  tagline?: string;
}

export function SplashScreen({
  tagline = 'Every life has a story worth keeping.',
}: SplashScreenProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-surface px-6 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 mesh-warm" />
        <div className="absolute inset-0 bg-paper-grain opacity-80" />
        <div className="absolute inset-0 bg-noise opacity-60 mix-blend-multiply" />
      </div>

      <div className="animate-ink-bleed flex flex-col items-center gap-6">
        <span className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-primary-dark md:h-24 md:w-24">
          <Feather
            className="h-9 w-9 animate-flame md:h-12 md:w-12"
            strokeWidth={1.4}
            aria-hidden
          />
        </span>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-text-primary md:text-7xl">
          The<span className="italic text-primary-dark">Untold</span>
        </h1>
        <p className="font-handwritten text-xl text-text-secondary md:text-2xl">
          {tagline}
        </p>
      </div>

      <div className="absolute bottom-12 flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary-dark/40"
            style={{ animation: `tick-up 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
