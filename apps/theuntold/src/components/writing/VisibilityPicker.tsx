import { Globe2, Lock, Users } from 'lucide-react';
import type { StoryVisibility } from '../../types/contracts';

const OPTIONS: { value: StoryVisibility; label: string; icon: typeof Lock }[] = [
  { value: 'private', label: 'Just me', icon: Lock },
  { value: 'family', label: 'Family', icon: Users },
  { value: 'community', label: 'Everyone', icon: Globe2 },
];

interface VisibilityPickerProps {
  value: StoryVisibility;
  onChange: (value: StoryVisibility) => void;
}

/** Who can read this story — private / family vault / community page. */
export function VisibilityPicker({ value, onChange }: VisibilityPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Who can read this story"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface/70 p-1 backdrop-blur"
    >
      {OPTIONS.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            value === v
              ? 'bg-primary text-surface'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
