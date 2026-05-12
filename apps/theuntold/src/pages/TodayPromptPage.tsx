import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, PenLine } from 'lucide-react';
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
    <div className="relative">
      <div className="absolute inset-0 -z-10 bg-paper-grain opacity-50" aria-hidden />

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      <header className="mx-auto max-w-story text-center">
        <p className="font-handwritten text-xl text-text-secondary">{prompt.dateLabel}</p>
        <h1 className="mt-2 font-display text-[28px] font-semibold leading-tight text-text-primary md:text-[40px]">
          {prompt.question}
        </h1>
        {prompt.helper && (
          <p className="mt-3 font-handwritten text-xl text-primary-dark">{prompt.helper}</p>
        )}
      </header>

      <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
        <PromptChoice
          icon={<Mic className="h-9 w-9" aria-hidden />}
          title="Speak it"
          body="Tell your story aloud. Five minutes is enough."
          onClick={() => choose('voice')}
        />
        <PromptChoice
          icon={<PenLine className="h-9 w-9" aria-hidden />}
          title="Write it"
          body="Type as slowly as you need. We&apos;ll save as you go."
          onClick={() => choose('text')}
        />
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-text-secondary hover:text-text-primary"
        >
          Skip today
        </button>
        <button
          type="button"
          onClick={() => navigate('/featured')}
          className="text-text-hint hover:text-text-secondary"
        >
          See past prompts
        </button>
      </div>
    </div>
  );
}

function PromptChoice({
  icon,
  title,
  body,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start gap-4 rounded-lg border bg-surface p-6 text-left transition-shadow hover:shadow-md md:p-8"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary-dark transition-transform group-hover:scale-105">
        {icon}
      </span>
      <div>
        <h3 className="font-display text-xl font-semibold text-text-primary md:text-2xl">
          {title}
        </h3>
        <p className="mt-1 text-sm text-text-secondary">{body}</p>
      </div>
    </button>
  );
}
