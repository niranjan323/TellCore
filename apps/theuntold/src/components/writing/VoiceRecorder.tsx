import { useEffect, useRef, useState } from 'react';
import { Mic, RotateCcw, Square } from 'lucide-react';
import { Button } from '../ui/Button';

type RecorderStatus = 'idle' | 'recording' | 'recorded';

interface VoiceRecorderProps {
  prompt?: string | null;
  onSave: (blob: Blob, durationSeconds: number) => void;
  onCancel: () => void;
  saving?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const mm = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const ss = (totalSec % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function VoiceRecorder({
  prompt,
  onSave,
  onCancel,
  saving = false,
  saveLabel = 'Save story',
  cancelLabel = 'Discard',
}: VoiceRecorderProps) {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopTimer();
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startTimer() {
    startedAtRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      setElapsed(Date.now() - startedAtRef.current);
    }, 200);
  }

  function stopTimer() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function start() {
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
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
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

  function stop() {
    stopTimer();
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }

  function reset() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    blobRef.current = null;
    setElapsed(0);
    setStatus('idle');
  }

  function save() {
    if (blobRef.current) onSave(blobRef.current, Math.floor(elapsed / 1000));
  }

  return (
    <section className="mx-auto flex max-w-story flex-col items-center px-4 py-8 text-center md:py-12">
      {prompt && (
        <p className="mb-10 max-w-md font-display text-lg italic text-text-secondary">
          {prompt}
        </p>
      )}

      <div className="my-4 flex flex-col items-center gap-5">
        {status === 'idle' && (
          <button
            type="button"
            onClick={start}
            aria-label="Start recording"
            className="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-surface shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Mic className="h-12 w-12" aria-hidden />
          </button>
        )}

        {status === 'recording' && (
          <>
            <button
              type="button"
              onClick={stop}
              aria-label="Stop recording"
              className="animate-warm-pulse flex h-32 w-32 items-center justify-center rounded-full bg-primary-dark text-surface shadow-lg"
            >
              <Square className="h-10 w-10" aria-hidden />
            </button>
            <Waveform />
          </>
        )}

        {status === 'recorded' && audioUrl && (
          <>
            <div className="w-full max-w-md">
              <audio controls src={audioUrl} className="w-full">
                <track kind="captions" />
              </audio>
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Record again
            </button>
          </>
        )}

        <div className="font-display text-2xl tabular-nums text-text-secondary md:text-3xl">
          {formatTime(elapsed)}
        </div>
      </div>

      <p className="font-handwritten text-lg text-text-secondary">
        Speak freely. We&apos;ll listen.
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-primary-dark">
          {error}
        </p>
      )}

      <div className="mt-10 flex w-full max-w-sm flex-col gap-2">
        <Button
          label={saveLabel}
          variant="primary"
          loading={saving}
          disabled={status !== 'recorded'}
          onClick={save}
          fullWidth
        />
        <Button label={cancelLabel} variant="ghost" onClick={onCancel} fullWidth />
      </div>
    </section>
  );
}

function Waveform() {
  return (
    <div className="flex h-12 items-center gap-1" aria-hidden>
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="block w-[3px] rounded-full bg-primary/70"
          style={{
            height: `${28 + Math.abs(Math.sin((i + 1) * 0.55)) * 72}%`,
            animation: `warm-pulse 1.${(i % 6) + 1}s ease-in-out infinite`,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}
