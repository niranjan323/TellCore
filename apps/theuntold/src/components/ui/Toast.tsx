import { useEffect } from 'react';
import { CheckCircle, Info, XCircle } from 'lucide-react';

export type ToastKind = 'success' | 'info' | 'error';

interface ToastProps {
  message: string;
  kind?: ToastKind;
  onDismiss: () => void;
  durationMs?: number;
}

const ICONS = {
  success: CheckCircle,
  info: Info,
  error: XCircle,
};

const STYLES: Record<ToastKind, string> = {
  success: 'bg-primary-light text-primary-dark',
  info: 'bg-surface-secondary text-text-primary',
  error: 'bg-primary-light text-primary-dark',
};

export function Toast({ message, kind = 'success', onDismiss, durationMs = 2600 }: ToastProps) {
  const Icon = ICONS[kind];
  useEffect(() => {
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [onDismiss, durationMs]);

  return (
    <div
      role="status"
      className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 animate-slow-rise rounded-md px-4 py-3 text-sm shadow-md ${STYLES[kind]}`}
    >
      <span className="inline-flex items-center gap-2">
        <Icon className="h-4 w-4" aria-hidden />
        {message}
      </span>
    </div>
  );
}
