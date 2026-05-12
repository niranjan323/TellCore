import { QuestionShell } from './QuestionShell';
import type { QuestionProps } from './types';

export function DateQuestion({
  id,
  label,
  helpText,
  value,
  onChange,
  required,
  placeholder,
}: QuestionProps) {
  const current = typeof value === 'string' ? value : '';
  return (
    <QuestionShell label={label} helpText={helpText} required={required} htmlFor={id}>
      <input
        id={id}
        type="date"
        value={current}
        placeholder={placeholder ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-surface px-4 py-3 text-[15px] text-text-primary focus:border-primary"
      />
    </QuestionShell>
  );
}
