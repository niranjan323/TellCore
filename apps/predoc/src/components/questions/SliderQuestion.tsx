import { QuestionShell } from './QuestionShell';
import type { QuestionProps } from './types';

interface SliderConfig {
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  showFaces?: boolean;
}

const FACES = ['😌', '🙂', '😐', '😕', '😟', '😣', '😖', '😫', '😩', '😖', '😣'];

export function SliderQuestion({
  id,
  label,
  helpText,
  value,
  onChange,
  required,
  config,
}: QuestionProps) {
  const cfg = (config as SliderConfig | null) ?? {};
  const min = cfg.min ?? 0;
  const max = cfg.max ?? 10;
  const step = cfg.step ?? 1;
  const current = typeof value === 'number' ? value : min;

  function indexFor(v: number): number {
    const span = max - min || 1;
    const idx = Math.round(((v - min) / span) * (FACES.length - 1));
    return Math.min(FACES.length - 1, Math.max(0, idx));
  }

  return (
    <QuestionShell label={label} helpText={helpText} required={required} htmlFor={id}>
      <div className="rounded-md border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-3xl" aria-hidden>
            {cfg.showFaces === false ? '' : FACES[indexFor(current)]}
          </span>
          <span className="text-3xl font-semibold text-primary-dark">{current}</span>
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="mt-2 flex justify-between text-xs text-text-secondary">
          <span>{cfg.minLabel ?? min}</span>
          <span>{cfg.maxLabel ?? max}</span>
        </div>
      </div>
    </QuestionShell>
  );
}
