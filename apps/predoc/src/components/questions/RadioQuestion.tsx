import { QuestionShell } from './QuestionShell';
import type { QuestionProps } from './types';

export function RadioQuestion({
  id,
  label,
  helpText,
  value,
  onChange,
  required,
  options = [],
}: QuestionProps) {
  const current = typeof value === 'string' ? value : '';
  return (
    <QuestionShell label={label} helpText={helpText} required={required}>
      <div id={id} role="radiogroup" className="flex flex-col gap-2">
        {options
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((opt) => {
            const active = current === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(opt.value)}
                className={`flex items-center gap-3 rounded-md border bg-surface px-4 py-3 text-left text-[15px] transition-colors hover:border-primary/40 hover:bg-primary-light ${
                  active ? 'border-primary bg-primary-light' : ''
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? 'border-primary' : 'border-text-hint'
                  }`}
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </span>
                <span className="text-text-primary">{opt.label}</span>
              </button>
            );
          })}
      </div>
    </QuestionShell>
  );
}
