import { useEffect, useRef, useState } from 'react';
import { Mic, Play, RotateCcw, Square } from 'lucide-react';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';

type RecorderStatus = 'idle' | 'recording' | 'recorded';

interface VoiceRecorderProps {
  onComplete: (blob: Blob) => void;
  onSkip: () => void;
  uploading?: boolean;
  title?: string;
  subtitle?: string;
  doneLabel?: string;
  skipLabel?: string;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const mm = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const ss = (totalSec % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function VoiceRecorder({
  onComplete,
  onSkip,
  uploading = false,
  title = 'Tell us in your own words',
  subtitle = "Speak freely. We'll listen.",
  doneLabel = 'Done',
  skipLabel = 'Skip',
}: VoiceRecorderProps) {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const startTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopTimer();
      recorderRef.current?.state === 'recording' && recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startTimer() {
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 200);
  }

  function stopTimer() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function startRecording() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Voice recording is not supported on this device.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        blobRef.current = blob;
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        setStatus('recorded');
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start();
      setStatus('recording');
      setElapsed(0);
      startTimer();
    } catch {
      setError('Please allow microphone access so we can hear you.');
    }
  }

  function stopRecording() {
    stopTimer();
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  }

  function resetRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    blobRef.current = null;
    setElapsed(0);
    setStatus('idle');
  }

  function handleDone() {
    if (blobRef.current) onComplete(blobRef.current);
  }

  return (
    <div className="mx-auto max-w-form rounded-lg bg-surface p-6 text-center shadow-sm md:p-10">
      <h2 className="text-xl font-semibold text-text-primary md:text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>

      <div className="my-8 flex flex-col items-center gap-4">
        {status === 'idle' && (
          <button
            type="button"
            onClick={startRecording}
            aria-label="Start recording"
            className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-surface shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <Mic className="h-9 w-9" aria-hidden />
          </button>
        )}

        {status === 'recording' && (
          <>
            <div className="animate-pulse-record flex h-24 w-24 items-center justify-center rounded-full bg-primary text-surface shadow-md">
              <Mic className="h-9 w-9" aria-hidden />
            </div>
            <Waveform />
            <button
              type="button"
              onClick={stopRecording}
              aria-label="Stop recording"
              className="inline-flex items-center gap-2 rounded-md border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-secondary"
            >
              <Square className="h-4 w-4" aria-hidden />
              Stop
            </button>
          </>
        )}

        {status === 'recorded' && audioUrl && (
          <>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-light text-primary-dark">
              <Play className="h-9 w-9" aria-hidden />
            </div>
            <audio controls src={audioUrl} className="w-full">
              <track kind="captions" />
            </audio>
            <button
              type="button"
              onClick={resetRecording}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Record again
            </button>
          </>
        )}

        <div className="font-mono text-lg tabular-nums text-text-secondary" aria-live="polite">
          {formatTime(elapsed)}
        </div>
      </div>

      {error && (
        <div className="mb-4 text-left">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          label={doneLabel}
          variant="primary"
          loading={uploading}
          disabled={status !== 'recorded'}
          onClick={handleDone}
          fullWidth
        />
        <Button label={skipLabel} variant="ghost" onClick={onSkip} fullWidth />
      </div>
    </div>
  );
}

function Waveform() {
  return (
    <div className="flex h-10 items-center gap-1.5" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="block w-1 rounded-full bg-primary/70"
          style={{
            height: `${30 + Math.abs(Math.sin((i + 1) * 0.6)) * 70}%`,
            animation: `pulse-record 1.${(i % 6) + 1}s ease-in-out infinite`,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}
