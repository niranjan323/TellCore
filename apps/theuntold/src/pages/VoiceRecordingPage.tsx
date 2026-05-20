import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { VoiceRecorder } from '../components/writing/VoiceRecorder';
import { Toast } from '../components/ui/Toast';
import { useDraftStore } from '../store/draftStore';
import { usePrompt } from '../hooks/usePrompt';

export function VoiceRecordingPage() {
  const navigate = useNavigate();
  const { prompt } = usePrompt();
  const setAudio = useDraftStore((s) => s.setAudio);
  const markSaved = useDraftStore((s) => s.markSaved);
  const reset = useDraftStore((s) => s.reset);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function handleSave(blob: Blob, durationSeconds: number) {
    setSaving(true);
    // The voice upload endpoint takes a sessionId. Until the Stories backend
    // exists we keep the recording in the local draft only — the URL goes to
    // sessionStorage and the story shows up in My Stories on next visit.
    const url = URL.createObjectURL(blob);
    setAudio(url, durationSeconds);
    markSaved();
    setToast('Saved to your library');
    setTimeout(() => {
      reset();
      setSaving(false);
      navigate('/stories', { replace: true });
    }, 1100);
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

      <div className="relative animate-page">
        <VoiceRecorder
          prompt={prompt.question}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      </div>

      {toast && <Toast message={toast} kind="success" onDismiss={() => setToast(null)} />}
    </div>
  );
}
