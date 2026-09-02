import { useEffect, useRef, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { CARD_TEMPLATES, renderStoryCard } from './storyCardRenderer';
import type { Story } from '../../types/contracts';

interface ShareCardModalProps {
  story: Story;
  open: boolean;
  onClose: () => void;
  onToast: (message: string) => void;
}

/** Turns a story into a template-styled image card to share or download. */
export function ShareCardModal({ story, open, onClose, onToast }: ShareCardModalProps) {
  const [templateKey, setTemplateKey] = useState(CARD_TEMPLATES[0].key);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const template = CARD_TEMPLATES.find((t) => t.key === templateKey) ?? CARD_TEMPLATES[0];
    setPreviewUrl(null);
    renderStoryCard(story, template)
      .then((blob) => {
        if (cancelled) return;
        blobRef.current = blob;
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
      })
      .catch(() => onToast("Couldn't render the card on this device"));
    return () => {
      cancelled = true;
    };
  }, [open, templateKey, story, onToast]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  if (!open) return null;

  async function handleShare() {
    const blob = blobRef.current;
    if (!blob) return;
    setBusy(true);
    try {
      const file = new File([blob], 'theuntold-story.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: story.title });
      } else {
        handleDownload();
      }
    } catch {
      // user cancelled the share sheet — not an error
    } finally {
      setBusy(false);
    }
  }

  function handleDownload() {
    const blob = blobRef.current;
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'theuntold-story.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    onToast('Card saved');
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share story as a card"
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-slow-rise rounded-lg bg-surface p-5 shadow-lg"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Share as a card
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

        <div className="flex flex-wrap gap-1.5">
          {CARD_TEMPLATES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTemplateKey(t.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                templateKey === t.key
                  ? 'bg-primary text-surface'
                  : 'border border-border bg-surface text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-center rounded-md bg-surface-secondary p-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`Preview of the story card for "${story.title}"`}
              className="max-h-[46vh] rounded-sm shadow-md"
            />
          ) : (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" />
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            label="Share"
            variant="primary"
            leadingIcon={<Share2 className="h-4 w-4" aria-hidden />}
            loading={busy}
            disabled={!previewUrl}
            onClick={handleShare}
            fullWidth
          />
          <Button
            label="Save image"
            variant="secondary"
            leadingIcon={<Download className="h-4 w-4" aria-hidden />}
            disabled={!previewUrl}
            onClick={handleDownload}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}
