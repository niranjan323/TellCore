import { Flame } from 'lucide-react';

interface StreakCounterProps {
  days: number;
  size?: 'sm' | 'md' | 'lg';
}

const dim: Record<NonNullable<StreakCounterProps['size']>, { box: string; ring: number; icon: number; num: string }> = {
  sm: { box: 'h-12 w-12', ring: 44,  icon: 16, num: 'text-xs' },
  md: { box: 'h-20 w-20', ring: 76,  icon: 22, num: 'text-base' },
  lg: { box: 'h-28 w-28', ring: 108, icon: 28, num: 'text-xl' },
};

function intensity(days: number) {
  if (days >= 100) return { strokePct: 1, color: 'var(--accent)',     glow: true };
  if (days >= 30)  return { strokePct: 0.75, color: 'var(--primary)', glow: true };
  if (days >= 7)   return { strokePct: 0.5,  color: 'var(--primary)', glow: false };
  return { strokePct: Math.max(0.1, days / 7), color: 'var(--text-hint)', glow: false };
}

export function StreakCounter({ days, size = 'md' }: StreakCounterProps) {
  const { box, ring, icon, num } = dim[size];
  const { strokePct, color, glow } = intensity(days);
  const radius = ring / 2 - 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - strokePct);

  return (
    <div className={`relative inline-flex items-center justify-center ${box}`}>
      <svg
        width={ring}
        height={ring}
        viewBox={`0 0 ${ring} ${ring}`}
        className={glow ? 'animate-warm-glow rounded-full' : ''}
        aria-hidden
      >
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke="var(--primary-light)"
          strokeWidth={4}
        />
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${ring / 2} ${ring / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-primary-dark">
        <Flame size={icon} aria-hidden />
        <span className={`mt-0.5 font-semibold tabular-nums ${num}`}>{days}</span>
      </div>
    </div>
  );
}
