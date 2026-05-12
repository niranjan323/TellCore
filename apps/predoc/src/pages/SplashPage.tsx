import { Logo } from '../components/ui/Logo';

interface SplashPageProps {
  message?: string;
}

export function SplashPage({ message = 'Getting things ready…' }: SplashPageProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface-secondary px-4 text-center">
      <div className="animate-pulse-record">
        <Logo size="lg" />
      </div>
      <p className="mt-2 text-sm text-text-secondary">{message}</p>
    </div>
  );
}
