import { QuestionShell } from './QuestionShell';
import type { QuestionProps } from './types';

interface TextInputConfig {
  inputType?: 'text' | 'email' | 'tel' | 'number';
  maxLength?: number;
}

export function TextInputQuestion({
  id,
  label,
  helpText,
  placeholder,
  value,
  onChange,
  required,
  config,
}: QuestionProps) {
  const cfg = (config as TextInputConfig | null) ?? {};
  const current = typeof value === 'string' ? value : value == null ? '' : String(value);

  return (
    <QuestionShell label={label} helpText={helpText} required={required} htmlFor={id}>
      <input
        id={id}
        type={cfg.inputType ?? 'text'}
        maxLength={cfg.maxLength ?? 200}
        placeholder={placeholder ?? ''}
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-surface px-4 py-3 text-[15px] text-text-primary placeholder:text-text-hint focus:border-primary"
      />
    </QuestionShell>
  );
}
