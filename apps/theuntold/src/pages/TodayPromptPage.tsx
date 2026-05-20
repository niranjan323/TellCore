import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, PenLine } from 'lucide-react';
import { WordReveal } from '../components/ui/WordReveal';
import { Postmark } from '../components/ui/PaperEphemera';
import { useMagnetic } from '../hooks/useMagnetic';
import { usePrompt } from '../hooks/usePrompt';
import { useDraftStore } from '../store/draftStore';

export function TodayPromptPage() {
  const navigate = useNavigate();
  const { prompt } = usePrompt();
  const setKind = useDraftStore((s) => s.setKind);

  function choose(kind: 'voice' | 'text') {
    setKind(kind, prompt.key);
    navigate(kind === 'voice' ? '/today/voice' : '/today/write');
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 mesh-warm opacity-90" />
        <div className="absolute inset-0 bg-paper-grain opacity-70" />
        <div className="absolute inset-0 bg-noise opacity-50 mix-blend-multiply" />
      </div>

      <div className="relative mx-auto max-w-page px-4 py-6 md:px-10 md:py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-sm font-medium text-text-secondary backdrop-blur transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>

        <header className="mx-auto max-w-story text-center">
          <p className="font-handwritten text-xl text-primary-dark md:text-2xl">
            <span className="handline">{prompt.dateLabel}</span>
          </p>
          <h1 className="mt-5 font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-text-primary md:text-[56px]">
            <WordReveal text={prompt.question} as="span" />
          </h1>
          {prompt.helper && (
            <p className="mt-5 font-handwritten text-xl text-primary-dark md:text-2xl">
              {prompt.helper}
            </p>
          )}

          <div className="mt-7 flex items-center justify-center">
            <Postmark city="TheUntold" dateLabel={new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} />
          </div>
        </header>

        <div className="mx-auto mt-12 grid max-w-3xl gap-5 md:grid-cols-2">
          <PromptChoice
            icon={<Mic className="h-10 w-10" aria-hidden />}
            kicker="Track A"
            title="Speak it"
            body="Tell it aloud — the unwritten cadence, the pauses, your laugh."
            stampLabel="Voice"
            onClick={() => choose('voice')}
          />
          <PromptChoice
            icon={<PenLine className="h-10 w-10" aria-hidden />}
            kicker="Track B"
            title="Write it"
            body="Type as slowly as you need. We&apos;ll save as you go."
            stampLabel="Pen"
            onClick={() => choose('text')}
          />
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
          >
            Skip today
          </button>
          <button
            type="button"
            onClick={() => navigate('/featured')}
            className="text-text-hint underline-offset-4 hover:text-text-secondary hover:underline"
          >
            See past prompts
          </button>
        </div>
      </div>
    </div>
  );
}

function PromptChoice({
  icon,
  kicker,
  title,
  body,
  stampLabel,
  onClick,
}: {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  body: string;
  stampLabel: string;
  onClick: () => void;
}) {
  const magneticRef = useMagnetic<HTMLButtonElement>(0.14);
  return (
    <button
      ref={magneticRef}
      type="button"
      onClick={onClick}
      className="postcard lift group relative flex flex-col items-start gap-5 overflow-hidden rounded-[20px] p-7 text-left md:p-9"
    >
      <span className="absolute right-5 top-5 stamp" style={{ transform: 'rotate(8deg)' }}>
        {stampLabel}
      </span>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary-dark transition-transform group-hover:scale-105">
        {icon}
      </span>
      <div>
        <p className="font-handwritten text-base text-primary-dark">{kicker}</p>
        <h3 className="mt-1 font-display text-2xl font-semibold text-text-primary md:text-3xl">
          {title}
        </h3>
        <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-text-secondary">{body}</p>
      </div>
    </button>
  );
}
