import { Info } from 'lucide-react';
import type { QuestionProps } from './types';

export function InfoBlock({ label, helpText }: QuestionProps) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-primary-light/60 p-4 text-text-primary">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary-dark" aria-hidden />
      <div className="text-[15px] leading-relaxed">
        <p className="font-medium">{label}</p>
        {helpText && <p className="mt-1 text-sm text-text-secondary">{helpText}</p>}
      </div>
    </div>
  );
}
