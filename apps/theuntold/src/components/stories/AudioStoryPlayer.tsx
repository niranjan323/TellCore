import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

interface AudioStoryPlayerProps {
  audioUrl: string | null;
  durationSeconds: number | null;
  /** Visual placeholder for when there is no actual audio (preview cards). */
  placeholder?: boolean;
}

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '00:00';
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

const SPEEDS: [number, string][] = [
  [0.75, '0.75x'],
  [1, '1x'],
  [1.25, '1.25x'],
  [1.5, '1.5x'],
];

const WAVE_BARS = Array.from({ length: 48 }, (_, i) =>
  20 + Math.abs(Math.sin(i * 0.7)) * 70 + (i % 5 === 0 ? 10 : 0),
);

export function AudioStoryPlayer({
  audioUrl,
  durationSeconds,
  placeholder = false,
}: AudioStoryPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds ?? 0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    function tick() {
      if (!el) return;
      setTime(el.currentTime);
      if (el.duration && !Number.isNaN(el.duration)) setDuration(el.duration);
    }
    el.addEventListener('timeupdate', tick);
    el.addEventListener('loadedmetadata', tick);
    el.addEventListener('ended', () => setPlaying(false));
    return () => {
      el.removeEventListener('timeupdate', tick);
      el.removeEventListener('loadedmetadata', tick);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  function toggle() {
    if (placeholder) return;
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play();
      setPlaying(true);
    }
  }

  function scrubTo(pct: number) {
    if (placeholder || !audioRef.current || !duration) return;
    audioRef.current.currentTime = pct * duration;
  }

  const progress = duration > 0 ? time / duration : 0;

  return (
    <div className="rounded-lg border bg-surface p-5">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-surface transition-colors hover:bg-primary-dark disabled:opacity-50"
          disabled={placeholder}
        >
          {playing ? <Pause className="h-6 w-6" aria-hidden /> : <Play className="ml-0.5 h-6 w-6" aria-hidden />}
        </button>

        <div className="flex-1">
          <div
            className="relative h-12 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              scrubTo((e.clientX - rect.left) / rect.width);
            }}
          >
            <div className="absolute inset-0 flex items-end justify-between gap-[2px]">
              {WAVE_BARS.map((h, i) => {
                const filled = i / WAVE_BARS.length < progress;
                return (
                  <span
                    key={i}
                    className={`block w-[3px] rounded-full ${
                      filled ? 'bg-primary' : 'bg-primary-light'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
            <span className="font-mono tabular-nums">{formatTime(time)}</span>
            <span className="font-mono tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1 text-xs">
        {SPEEDS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSpeed(value)}
            disabled={placeholder}
            className={`rounded-md px-2 py-1 transition-colors ${
              speed === value
                ? 'bg-primary-light text-primary-dark'
                : 'text-text-secondary hover:bg-surface-secondary'
            } disabled:opacity-50`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
