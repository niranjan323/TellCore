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
    <div className="min-h-dvh bg-surface">
      <header className="flex items-center justify-between px-4 py-4 md:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <span className="font-handwritten text-base text-text-secondary">
          {prompt.dateLabel}
        </span>
      </header>

      <VoiceRecorder
        prompt={prompt.question}
        onSave={handleSave}
        onCancel={handleCancel}
        saving={saving}
      />

      {toast && <Toast message={toast} kind="success" onDismiss={() => setToast(null)} />}
    </div>
  );
}
