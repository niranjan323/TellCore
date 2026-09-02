import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { VoiceRecorder } from '../components/voice/VoiceRecorder';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { MeshBackground } from '../components/ui/MeshBackground';
import { uploadVoiceNote } from '../api/sessions.api';
import { useSessionStore } from '../store/sessionStore';

export function VoiceNotePage() {
  const navigate = useNavigate();
  const sessionId = useSessionStore((s) => s.sessionId);
  const setVoiceNoteUrl = useSessionStore((s) => s.setVoiceNoteUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!sessionId) {
    navigate('/', { replace: true });
    return null;
  }

  async function handleComplete(blob: Blob) {
    setUploading(true);
    setError(null);
    try {
      const ext = blob.type.includes('mp4') ? 'm4a' : 'webm';
      const res = await uploadVoiceNote(sessionId!, blob, `voice.${ext}`);
      setVoiceNoteUrl(res.voiceNoteUrl);
      navigate('/questions');
    } catch {
      setError("We couldn't upload your voice note. You can skip it and continue.");
    } finally {
      setUploading(false);
    }
  }

  function handleSkip() {
    setVoiceNoteUrl(null);
    navigate('/questions');
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface">
      <MeshBackground variant="breath" />

      <div className="relative animate-page mx-auto max-w-page px-4 py-4 md:px-8 md:py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-sm font-medium text-text-secondary backdrop-blur transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>

        <p className="mx-auto mb-2 max-w-form text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
          Step 1 of 2 · Voice
        </p>
        <h1 className="mx-auto mb-6 max-w-form text-center text-[24px] font-semibold leading-tight text-text-primary md:text-[32px]">
          Tell us first, in your own words.
        </h1>

        {error && (
          <div className="mx-auto mb-4 max-w-form">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="glass-card mx-auto max-w-form rounded-[20px] p-2 md:p-3">
          <VoiceRecorder
            onComplete={handleComplete}
            onSkip={handleSkip}
            uploading={uploading}
          />
        </div>
      </div>
    </div>
  );
}
