import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { isAxiosError } from 'axios';
import { VoiceRecorder } from '../components/writing/VoiceRecorder';
import { VisibilityPicker } from '../components/writing/VisibilityPicker';
import { Toast, type ToastKind } from '../components/ui/Toast';
import { createStory, processStory, uploadStoryVoice } from '../api/stories.api';
import { useDraftStore } from '../store/draftStore';
import { usePrompt } from '../hooks/usePrompt';

export function VoiceRecordingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { prompt } = usePrompt();
  const tags = useDraftStore((s) => s.tags);
  const visibility = useDraftStore((s) => s.visibility);
  const setVisibility = useDraftStore((s) => s.setVisibility);
  const reset = useDraftStore((s) => s.reset);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);

  async function handleSave(blob: Blob, durationSeconds: number) {
    setSaving(true);
    try {
      const created = await createStory({
        kind: 'voice',
        visibility,
        promptKey: prompt.key,
        tags,
      });
      await uploadStoryVoice(created.storyId, blob, durationSeconds);
      await processStory(created.storyId);
      await queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      await queryClient.invalidateQueries({ queryKey: ['streak'] });
      setToast({ message: 'Saved to your library', kind: 'success' });
      setTimeout(() => {
        reset();
        setSaving(false);
        navigate('/stories', { replace: true });
      }, 1100);
    } catch (error) {
      setSaving(false);
      const limitHit =
        isAxiosError(error) && error.response?.data?.error === 'story_limit_reached';
      setToast({
        message: limitHit
          ? 'Free story limit reached — upgrade to keep recording.'
          : 'Could not save right now — try again.',
        kind: 'error',
      });
    }
  }

  function handleCancel() {
    reset();
    navigate(-1);
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 mesh-warm opacity-90" />
        <div className="absolute inset-0 bg-paper-grain opacity-70" />
        <div className="absolute inset-0 bg-noise opacity-50 mix-blend-multiply" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-4 py-4 md:px-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-sm font-medium text-text-secondary backdrop-blur transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <span className="inline-flex items-center gap-2 font-handwritten text-base text-text-secondary md:text-lg">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          {prompt.dateLabel}
        </span>
      </header>

      <div className="relative z-10 flex justify-center px-4 pt-2">
        <VisibilityPicker value={visibility} onChange={setVisibility} />
      </div>

      <div className="relative animate-page">
        <VoiceRecorder
          prompt={prompt.question}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      </div>

      {toast && <Toast message={toast.message} kind={toast.kind} onDismiss={() => setToast(null)} />}
    </div>
  );
}
