import { Button } from './Button';

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-slow-rise rounded-lg bg-surface p-6 shadow-lg"
      >
        <h2 className="font-display text-xl font-semibold text-text-primary">{title}</h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <Button
            label={confirmLabel}
            variant={destructive ? 'primary' : 'primary'}
            onClick={onConfirm}
            fullWidth
          />
          <Button label={cancelLabel} variant="ghost" onClick={onCancel} fullWidth />
        </div>
      </div>
    </div>
  );
}
