import { QuestionShell } from './QuestionShell';
import type { QuestionProps } from './types';

interface TextAreaConfig {
  maxLength?: number;
  rows?: number;
}

export function TextAreaQuestion({
  id,
  label,
  helpText,
  placeholder,
  value,
  onChange,
  required,
  config,
}: QuestionProps) {
  const cfg = (config as TextAreaConfig | null) ?? {};
  const maxLength = cfg.maxLength ?? 1000;
  const rows = cfg.rows ?? 5;
  const current = typeof value === 'string' ? value : '';

  return (
    <QuestionShell label={label} helpText={helpText} required={required} htmlFor={id}>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder ?? ''}
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-md border bg-surface px-4 py-3 text-[15px] text-text-primary placeholder:text-text-hint focus:border-primary"
      />
      <div className="text-right text-xs text-text-hint">
        {current.length} / {maxLength}
      </div>
    </QuestionShell>
  );
}
