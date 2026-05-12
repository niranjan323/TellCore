import { useState } from 'react';
import { QuestionShell } from './QuestionShell';
import type { QuestionProps } from './types';

type BodyView = 'front' | 'back';

interface BodyRegion {
  key: string;
  label: string;
  view: BodyView;
  d: string;
}

const REGIONS: BodyRegion[] = [
  { key: 'head', label: 'Head', view: 'front', d: 'M75 18 a18 18 0 1 0 0.01 0 Z' },
  { key: 'neck', label: 'Neck', view: 'front', d: 'M64 50 h22 v14 h-22 z' },
  { key: 'chest', label: 'Chest', view: 'front', d: 'M44 64 h62 v40 h-62 z' },
  { key: 'abdomen', label: 'Abdomen', view: 'front', d: 'M50 104 h50 v34 h-50 z' },
  { key: 'pelvis', label: 'Pelvis', view: 'front', d: 'M52 138 h46 v22 h-46 z' },
  { key: 'left-arm', label: 'Left arm', view: 'front', d: 'M22 70 h22 v82 h-22 z' },
  { key: 'right-arm', label: 'Right arm', view: 'front', d: 'M106 70 h22 v82 h-22 z' },
  { key: 'left-leg', label: 'Left leg', view: 'front', d: 'M52 160 h22 v100 h-22 z' },
  { key: 'right-leg', label: 'Right leg', view: 'front', d: 'M76 160 h22 v100 h-22 z' },

  { key: 'back-head', label: 'Back of head', view: 'back', d: 'M75 18 a18 18 0 1 0 0.01 0 Z' },
  { key: 'upper-back', label: 'Upper back', view: 'back', d: 'M44 64 h62 v44 h-62 z' },
  { key: 'lower-back', label: 'Lower back', view: 'back', d: 'M50 108 h50 v34 h-50 z' },
  { key: 'buttocks', label: 'Buttocks', view: 'back', d: 'M52 142 h46 v24 h-46 z' },
  { key: 'left-arm-back', label: 'Left arm (back)', view: 'back', d: 'M22 70 h22 v82 h-22 z' },
  { key: 'right-arm-back', label: 'Right arm (back)', view: 'back', d: 'M106 70 h22 v82 h-22 z' },
  { key: 'left-leg-back', label: 'Left leg (back)', view: 'back', d: 'M52 166 h22 v94 h-22 z' },
  { key: 'right-leg-back', label: 'Right leg (back)', view: 'back', d: 'M76 166 h22 v94 h-22 z' },
];

export function BodyMapQuestion({
  id,
  label,
  helpText,
  value,
  onChange,
  required,
}: QuestionProps) {
  const [view, setView] = useState<BodyView>('front');
  const selected = Array.isArray(value) ? (value as string[]) : [];

  function toggle(key: string) {
    const set = new Set(selected);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    onChange(Array.from(set));
  }

  return (
    <QuestionShell label={label} helpText={helpText} required={required}>
      <div id={id} className="rounded-md border bg-surface p-4">
        <div className="mb-3 flex items-center justify-center gap-1 rounded-md bg-surface-secondary p-1 text-sm">
          {(['front', 'back'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors ${
                view === v ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'
              }`}
            >
              {v === 'front' ? 'Front' : 'Back'}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <svg
            viewBox="0 0 150 280"
            className="h-72 w-auto"
            role="img"
            aria-label="Body diagram"
          >
            {REGIONS.filter((r) => r.view === view).map((region) => {
              const active = selected.includes(region.key);
              return (
                <path
                  key={region.key}
                  d={region.d}
                  onClick={() => toggle(region.key)}
                  className={`cursor-pointer transition-colors ${
                    active ? 'fill-primary' : 'fill-primary-light hover:fill-primary/40'
                  }`}
                  stroke="var(--primary-dark)"
                  strokeWidth={0.5}
                  role="button"
                  aria-pressed={active}
                  aria-label={region.label}
                />
              );
            })}
          </svg>
        </div>

        {selected.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {selected.map((key) => {
              const label = REGIONS.find((r) => r.key === key)?.label ?? key;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-md bg-primary-light px-2 py-1 text-xs font-medium text-primary-dark"
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </QuestionShell>
  );
}
