import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mic, ShieldCheck, Sparkles, WifiOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { Logo } from '../components/ui/Logo';
import { MeshBackground } from '../components/ui/MeshBackground';
import { Spinner } from '../components/ui/Spinner';
import { WordReveal } from '../components/ui/WordReveal';
import { useAppConfig } from '../hooks/useAppConfig';
import { useDefaultFormSet } from '../hooks/useFormSet';
import { createSession } from '../api/sessions.api';
import { buildAbsoluteUrl } from '../api/client';
import { useSessionStore } from '../store/sessionStore';

export function IntroPage() {
  const navigate = useNavigate();
  const cfg = useAppConfig();
  const language = useSessionStore((s) => s.languageCode);
  const setLanguage = useSessionStore((s) => s.setLanguage);
  const startSession = useSessionStore((s) => s.startSession);
  const setVoiceNoteUrl = useSessionStore((s) => s.setVoiceNoteUrl);

  const supported = cfg.data?.supportedLanguages ?? ['en'];
  const activeLang = supported.includes(language) ? language : cfg.data?.defaultLanguage ?? 'en';

  const form = useDefaultFormSet(activeLang);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intro = form.data?.intro ?? null;
  const audioUrl = useMemo(() => buildAbsoluteUrl(intro?.audioUrl ?? null), [intro?.audioUrl]);

  async function startJourney(withVoiceNote: boolean) {
    if (!form.data) return;
    setStarting(true);
    setError(null);
    try {
      const session = await createSession({
        productSlug: cfg.data?.slug ?? 'predoc',
        formSetId: form.data.formSetId,
        languageCode: activeLang,
      });
      startSession({
        sessionId: session.sessionId,
        formSetId: form.data.formSetId,
        formSetSlug: form.data.slug,
        languageCode: activeLang,
      });
      setVoiceNoteUrl(null);
      navigate(withVoiceNote ? '/voice' : '/questions', { replace: true });
    } catch {
      setError("We couldn't start your visit. Please try again.");
    } finally {
      setStarting(false);
    }
  }

  if (cfg.isLoading || form.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (cfg.isError || form.isError || !form.data) {
    return (
      <div className="mx-auto max-w-form">
        <ErrorMessage
          message="We couldn't load PreDoc right now. Check your connection and try again."
          retry={() => {
            cfg.refetch();
            form.refetch();
          }}
        />
      </div>
    );
  }

  const title = intro?.title ?? "Let's prepare for your visit";
  const subtitle = intro?.subtitle ?? null;
  const body =
    intro?.body ??
    "Answer a few simple questions. We'll help you put it all together for your doctor — clear, organised, and in your own words.";

  return (
    <div className="relative overflow-hidden">
      <MeshBackground variant="breath" />

      <div className="relative mx-auto max-w-intro py-4 md:py-12">
        <div className="mb-7 flex items-center justify-between">
          <Logo size="sm" />
          <LanguageSelector
            value={activeLang}
            options={supported}
            onChange={setLanguage}
          />
        </div>

        <div className="glass-card relative overflow-hidden rounded-[22px] p-6 md:p-10">
          <span
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary-light animate-ring-breathe"
            aria-hidden
          />
          <div className="relative">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-light/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-primary-dark">
              <Sparkles className="h-3 w-3" aria-hidden />
              Five quiet minutes
            </p>

            <h1 className="text-[30px] font-semibold leading-[1.05] tracking-tight text-text-primary md:text-[40px]">
              <WordReveal text={title} as="span" className="block" />
            </h1>

            {subtitle && (
              <p className="mt-3 font-medium text-text-secondary md:text-lg">
                {subtitle}
              </p>
            )}
            <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">{body}</p>

            {audioUrl && (
              <audio controls className="mt-5 w-full" src={audioUrl}>
                <track kind="captions" />
              </audio>
            )}

            {error && (
              <div className="mt-5">
                <ErrorMessage message={error} />
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3">
              <Button
                label={intro?.primaryButtonLabel ?? 'Start'}
                variant="primary"
                loading={starting}
                trailingIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
                onClick={() => startJourney(false)}
                fullWidth
              />
              {intro?.voiceNoteEnabled && (
                <Button
                  label="Record a voice note first"
                  variant="ghost"
                  leadingIcon={<Mic className="h-4 w-4" aria-hidden />}
                  onClick={() => startJourney(true)}
                  fullWidth
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-text-hint">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            No account needed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <WifiOff className="h-4 w-4" aria-hidden />
            Works offline
          </span>
        </div>
      </div>
    </div>
  );
}
