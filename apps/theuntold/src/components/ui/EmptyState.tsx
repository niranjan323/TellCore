import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  illustration?: ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({
  illustration,
  title,
  description,
  ctaLabel,
  onCta,
}: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-lg bg-surface p-10 text-center">
      {illustration && <div className="mb-5 text-primary">{illustration}</div>}
      <h2 className="font-display text-2xl font-semibold text-text-primary">{title}</h2>
      {description && (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      )}
      {ctaLabel && onCta && (
        <div className="mt-6">
          <Button label={ctaLabel} onClick={onCta} />
        </div>
      )}
    </div>
  );
}
