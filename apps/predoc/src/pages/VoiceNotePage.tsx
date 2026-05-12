import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { VoiceRecorder } from '../components/voice/VoiceRecorder';
import { ErrorMessage } from '../components/ui/ErrorMessage';
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
    <div className="animate-fade-in py-4 md:py-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>
      {error && (
        <div className="mx-auto mb-4 max-w-form">
          <ErrorMessage message={error} />
        </div>
      )}
      <VoiceRecorder onComplete={handleComplete} onSkip={handleSkip} uploading={uploading} />
    </div>
  );
}
