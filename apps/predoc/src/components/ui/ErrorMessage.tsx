import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  retry?: () => void;
  retryLabel?: string;
}

export function ErrorMessage({ message, retry, retryLabel = 'Try again' }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-error/30 bg-error/5 p-4 text-text-primary"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" aria-hidden />
      <div className="flex-1 text-sm leading-relaxed">{message}</div>
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
