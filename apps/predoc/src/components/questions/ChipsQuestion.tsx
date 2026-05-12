import { QuestionShell } from './QuestionShell';
import type { QuestionProps } from './types';

interface ChipsConfig {
  multi?: boolean;
}

export function ChipsQuestion({
  id,
  label,
  helpText,
  value,
  onChange,
  required,
  options = [],
  config,
}: QuestionProps) {
  const cfg = (config as ChipsConfig | null) ?? {};
  const multi = cfg.multi ?? false;
  const selected = multi
    ? Array.isArray(value)
      ? (value as string[])
      : []
    : typeof value === 'string'
      ? [value]
      : [];

  function toggle(optValue: string) {
    if (multi) {
      const set = new Set(selected);
      if (set.has(optValue)) set.delete(optValue);
      else set.add(optValue);
      onChange(Array.from(set));
    } else {
      onChange(selected[0] === optValue ? '' : optValue);
    }
  }

  return (
    <QuestionShell label={label} helpText={helpText} required={required}>
      <div id={id} role={multi ? 'group' : 'radiogroup'} className="flex flex-wrap gap-2">
        {options
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                role={multi ? 'checkbox' : 'radio'}
                aria-checked={active}
                onClick={() => toggle(opt.value)}
                className={`min-h-[44px] rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-primary bg-primary text-surface'
                    : 'bg-surface text-text-primary hover:border-primary/40 hover:bg-primary-light'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
      </div>
    </QuestionShell>
  );
}
