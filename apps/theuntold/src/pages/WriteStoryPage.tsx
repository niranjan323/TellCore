import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check } from 'lucide-react';
import { isAxiosError } from 'axios';
import { Button } from '../components/ui/Button';
import { TextEditor } from '../components/writing/TextEditor';
import { VisibilityPicker } from '../components/writing/VisibilityPicker';
import { Toast, type ToastKind } from '../components/ui/Toast';
import { createStory, processStory } from '../api/stories.api';
import { useDraftStore } from '../store/draftStore';
import { usePrompt } from '../hooks/usePrompt';

function relativeAgo(iso: string | null): string | null {
  if (!iso) return null;
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 5) return 'Saved just now';
  if (seconds < 60) return `Saved ${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Saved ${minutes} min ago`;
  return 'Saved a while ago';
}

export function WriteStoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { prompt } = usePrompt();
  const text = useDraftStore((s) => s.text);
  const setText = useDraftStore((s) => s.setText);
  const tags = useDraftStore((s) => s.tags);
  const visibility = useDraftStore((s) => s.visibility);
  const setVisibility = useDraftStore((s) => s.setVisibility);
  const lastSavedAt = useDraftStore((s) => s.lastSavedAt);
  const markSaved = useDraftStore((s) => s.markSaved);
  const reset = useDraftStore((s) => s.reset);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);

  // Auto-save every 3 seconds when text changes.
  useEffect(() => {
    if (!text) return;
    const id = window.setTimeout(() => markSaved(), 3000);
    return () => window.clearTimeout(id);
  }, [text, markSaved]);

  // Re-render once a minute so the "Saved X ago" indicator stays fresh.
  const [, force] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  async function handleSave() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const created = await createStory({
        text,
        kind: 'text',
        visibility,
        promptKey: prompt.key,
        tags,
      });
      await processStory(created.storyId);
      await queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      await queryClient.invalidateQueries({ queryKey: ['streak'] });
      setToast({ message: 'Story saved to your library', kind: 'success' });
      setTimeout(() => {
        reset();
        setSaving(false);
        navigate('/stories', { replace: true });
      }, 900);
    } catch (error) {
      setSaving(false);
      const limitHit =
        isAxiosError(error) && error.response?.data?.error === 'story_limit_reached';
      setToast({
        message: limitHit
          ? 'Free story limit reached — upgrade to keep writing.'
          : 'Could not save right now. Your draft is safe — try again.',
        kind: 'error',
      });
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-paper-grain opacity-80" />
        <div className="absolute inset-0 bg-noise opacity-40 mix-blend-multiply" />
        {/* faint ruled lines like a notebook */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0, transparent 35px, rgba(89,71,55,0.10) 35px, rgba(89,71,55,0.10) 36px)',
          }}
        />
      </div>

      <header className="pt-safe sticky top-0 z-10 flex items-center justify-between border-b bg-surface/80 px-4 py-3 backdrop-blur md:px-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-sm font-medium text-text-secondary backdrop-blur transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <p className="hidden font-handwritten text-base text-text-secondary md:block">
          A page from {prompt.dateLabel}
        </p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary-dark transition-opacity ${
            lastSavedAt ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Check className="h-3.5 w-3.5" aria-hidden />
          {lastSavedAt ? relativeAgo(lastSavedAt) : 'Saving…'}
        </span>
      </header>

      <main className="animate-page relative px-4 py-10 md:px-10 md:py-16">
        <TextEditor value={text} onChange={setText} prompt={prompt.question} />
      </main>

      <footer className="sticky bottom-0 border-t bg-surface/85 px-4 py-3 backdrop-blur md:px-10 md:py-4">
        <div className="mx-auto flex max-w-story flex-wrap items-center justify-between gap-3">
          <VisibilityPicker value={visibility} onChange={setVisibility} />
          <Button
            label="Save story"
            variant="primary"
            disabled={!text.trim()}
            loading={saving}
            onClick={handleSave}
          />
        </div>
      </footer>

      {toast && <Toast message={toast.message} kind={toast.kind} onDismiss={() => setToast(null)} />}
    </div>
  );
}
