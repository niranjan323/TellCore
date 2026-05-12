import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ShieldCheck, WifiOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { Logo } from '../components/ui/Logo';
import { Spinner } from '../components/ui/Spinner';
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

  return (
    <div className="mx-auto max-w-intro animate-fade-in py-4 md:py-12">
      <div className="mb-6 flex items-center justify-between">
        <Logo size="sm" />
        <LanguageSelector
          value={activeLang}
          options={supported}
          onChange={setLanguage}
        />
      </div>

      <div className="rounded-lg bg-surface p-6 shadow-sm md:p-10">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary md:text-[32px]">
          {intro?.title ?? "Let's prepare for your visit"}
        </h1>
        {intro?.subtitle && (
          <p className="mt-2 text-base text-text-secondary">{intro.subtitle}</p>
        )}
        <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
          {intro?.body ??
            "Answer a few simple questions. We'll help you put it all together for your doctor — clear, organised, and in your own words."}
        </p>

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
  );
}
