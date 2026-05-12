import { Check } from 'lucide-react';
import { QuestionShell } from './QuestionShell';
import type { QuestionProps } from './types';

export function CheckboxQuestion({
  id,
  label,
  helpText,
  value,
  onChange,
  required,
  options = [],
}: QuestionProps) {
  const selected = Array.isArray(value) ? (value as string[]) : [];

  function toggle(optValue: string) {
    const set = new Set(selected);
    if (set.has(optValue)) set.delete(optValue);
    else set.add(optValue);
    onChange(Array.from(set));
  }

  return (
    <QuestionShell label={label} helpText={helpText} required={required}>
      <div id={id} role="group" className="flex flex-col gap-2">
        {options
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                role="checkbox"
                aria-checked={active}
                onClick={() => toggle(opt.value)}
                className={`flex items-center gap-3 rounded-md border bg-surface px-4 py-3 text-left text-[15px] transition-colors hover:border-primary/40 hover:bg-primary-light ${
                  active ? 'border-primary bg-primary-light' : ''
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 ${
                    active ? 'border-primary bg-primary text-surface' : 'border-text-hint'
                  }`}
                >
                  {active && <Check className="h-3.5 w-3.5" aria-hidden />}
                </span>
                <span className="text-text-primary">{opt.label}</span>
              </button>
            );
          })}
      </div>
    </QuestionShell>
  );
}
