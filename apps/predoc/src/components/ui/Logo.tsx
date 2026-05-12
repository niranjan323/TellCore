import { Stethoscope } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const ringSize: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-8 w-8',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
};

const iconSize: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 16,
  md: 22,
  lg: 28,
};

export function Logo({ size = 'md', label = 'PreDoc' }: LogoProps) {
  return (
    <div className="inline-flex items-center gap-2.5" aria-label={label}>
      <span
        className={`inline-flex items-center justify-center rounded-md bg-primary-light text-primary-dark ${ringSize[size]}`}
      >
        <Stethoscope size={iconSize[size]} strokeWidth={2} aria-hidden />
      </span>
      <span className="font-semibold tracking-tight text-text-primary">{label}</span>
    </div>
  );
}
