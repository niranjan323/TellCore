import { Feather } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
}

const wordSize: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-5xl md:text-6xl',
};

const iconSize: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 16,
  md: 20,
  lg: 26,
  xl: 36,
};

export function Logo({ size = 'md', showWordmark = true }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="TheUntold">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary-dark">
        <Feather size={iconSize[size]} strokeWidth={1.8} aria-hidden />
      </span>
      {showWordmark && (
        <span className={`font-display tracking-tight text-text-primary ${wordSize[size]}`}>
          The<span className="italic text-primary-dark">Untold</span>
        </span>
      )}
    </span>
  );
}
