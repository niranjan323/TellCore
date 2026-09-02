import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Flag, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { reportStory } from '../../api/stories.api';

const REASONS = [
  { value: 'harmful', label: 'Harmful or unsafe content' },
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'private-info', label: "Someone's private information" },
  { value: 'plagiarism', label: 'Copied from somewhere else' },
  { value: 'other', label: 'Something else' },
];

interface ReportStoryModalProps {
  storyId: string;
  open: boolean;
  onClose: () => void;
  onToast: (message: string) => void;
}

export function ReportStoryModal({ storyId, open, onClose, onToast }: ReportStoryModalProps) {
  const [reason, setReason] = useState('harmful');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    setSending(true);
    try {
      await reportStory(storyId, reason, details || undefined);
      onToast("Thank you — we'll review this story.");
      onClose();
    } catch (error) {
      const code = isAxiosError(error) ? error.response?.data?.error : undefined;
      onToast(
        code === 'already_reported'
          ? "You've already reported this story — it's in our queue."
          : "Couldn't send the report right now — try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Report this story"
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-slow-rise rounded-lg bg-surface p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold text-text-primary">
            <Flag className="h-4 w-4 text-primary" aria-hidden />
            Report this story
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-secondary"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Why are you reporting it?</legend>
          {REASONS.map((r) => (
            <label
              key={r.value}
              className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors ${
                reason === r.value
                  ? 'border-primary bg-primary-light/50 text-text-primary'
                  : 'border-border text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              <input
                type="radio"
                name="report-reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="accent-[var(--primary)]"
              />
              {r.label}
            </label>
          ))}
        </fieldset>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value.slice(0, 500))}
          placeholder="Anything else we should know? (optional)"
          rows={3}
          className="mt-3 w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none placeholder:text-text-hint focus:border-primary"
        />

        <div className="mt-4 flex gap-2">
          <Button label="Cancel" variant="ghost" onClick={onClose} fullWidth />
          <Button label="Send report" variant="primary" loading={sending} onClick={handleSubmit} fullWidth />
        </div>
      </div>
    </div>
  );
}
