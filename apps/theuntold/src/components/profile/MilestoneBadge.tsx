import { Flame, Mic, PenLine, Sparkles, Trophy, type LucideIcon } from 'lucide-react';
import type { Milestone } from '../../types/contracts';

const ICONS: Record<string, LucideIcon> = {
  'pen-line': PenLine,
  flame: Flame,
  sparkles: Sparkles,
  mic: Mic,
  trophy: Trophy,
};

interface MilestoneBadgeProps {
  milestone: Milestone;
}

function relativeDate(iso: string | null): string {
  if (!iso) return 'Not yet';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function MilestoneBadge({ milestone }: MilestoneBadgeProps) {
  const Icon = ICONS[milestone.icon] ?? Trophy;
  const achieved = !!milestone.achievedAt;
  return (
    <div
      className={`flex items-center gap-4 rounded-md border p-4 ${
        achieved ? 'bg-surface' : 'bg-surface-secondary/60'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          milestone.highlight
            ? 'bg-accent/40 text-primary-dark'
            : achieved
              ? 'bg-primary-light text-primary-dark'
              : 'bg-surface-secondary text-text-hint'
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="flex-1">
        <div className={`text-sm font-medium ${achieved ? 'text-text-primary' : 'text-text-secondary'}`}>
          {milestone.label}
        </div>
        <div className="font-handwritten text-base text-text-secondary">
          {relativeDate(milestone.achievedAt)}
        </div>
      </div>
    </div>
  );
}
