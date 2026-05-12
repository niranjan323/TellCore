import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Spinner } from '../components/ui/Spinner';
import {
  isAnswered,
  shouldShowQuestion,
} from '../components/questions/ConditionEngine';
import { QuestionRenderer } from '../components/questions/QuestionRenderer';
import { useAppConfig } from '../hooks/useAppConfig';
import { useDefaultFormSet } from '../hooks/useFormSet';
import { submitResponse } from '../api/responses.api';
import { useSessionStore } from '../store/sessionStore';

export function QuestionsPage() {
  const navigate = useNavigate();
  const cfg = useAppConfig();
  const sessionId = useSessionStore((s) => s.sessionId);
  const formSetId = useSessionStore((s) => s.formSetId);
  const voiceNoteUrl = useSessionStore((s) => s.voiceNoteUrl);
  const answers = useSessionStore((s) => s.answers);
  const setAnswer = useSessionStore((s) => s.setAnswer);
  const currentStep = useSessionStore((s) => s.currentStep);
  const setStep = useSessionStore((s) => s.setStep);
  const setSummary = useSessionStore((s) => s.setSummary);
  const language = useSessionStore((s) => s.languageCode);
  const setLanguage = useSessionStore((s) => s.setLanguage);

  const supported = cfg.data?.supportedLanguages ?? ['en'];
  const form = useDefaultFormSet(language);

  const visibleQuestions = useMemo(() => {
    if (!form.data) return [];
    return form.data.questions
      .slice()
      .sort((a, b) => a.order - b.order)
      .filter((q) => shouldShowQuestion(q, answers));
  }, [form.data, answers]);

  const total = visibleQuestions.length;
  const safeIndex = total === 0 ? 0 : Math.min(currentStep, total - 1);
  const question = visibleQuestions[safeIndex];

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (currentStep > total - 1 && total > 0) {
      setStep(total - 1);
    }
  }, [currentStep, total, setStep]);

  useEffect(() => {
    if (!sessionId || !formSetId) {
      navigate('/', { replace: true });
    }
  }, [sessionId, formSetId, navigate]);

  if (form.isLoading || cfg.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (form.isError || !form.data) {
    return (
      <div className="mx-auto max-w-form">
        <ErrorMessage
          message="We couldn't load your questions. Please try again."
          retry={() => form.refetch()}
        />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-form text-center text-text-secondary">
        No questions to show.
      </div>
    );
  }

  const isLast = safeIndex === total - 1;
  const canProceed =
    !question.isRequired || isAnswered(question, answers[question.key]);

  function goBack() {
    if (safeIndex === 0) {
      navigate('/');
      return;
    }
    setStep(safeIndex - 1);
  }

  async function handleNext() {
    if (!isLast) {
      setStep(safeIndex + 1);
      return;
    }
    if (!sessionId || !formSetId || !form.data) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const summary = await submitResponse({
        sessionId,
        formSetId,
        languageCode: language,
        answers,
        voiceNoteUrl,
      });
      setSummary(summary);
      navigate(`/summary/${summary.sessionId}`, { replace: true });
    } catch {
      setSubmitError("We couldn't submit your answers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    navigate('/', { replace: true });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-secondary">
      <ProgressBar value={safeIndex + 1} max={total} label="Form progress" />

      <header className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="text-sm text-text-secondary">
          Question {safeIndex + 1} of {total}
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector
            value={language}
            options={supported}
            onChange={(lang) => {
              setLanguage(lang);
              setStep(0);
            }}
          />
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="rounded-md p-2 text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-form flex-1 flex-col justify-center px-4 py-6 md:px-6">
        <div key={question.id} className="animate-fade-in">
          <QuestionRenderer
            question={question}
            value={answers[question.key]}
            onChange={(val) => setAnswer(question.key, val)}
          />
        </div>

        {submitError && (
          <div className="mt-5">
            <ErrorMessage message={submitError} />
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 border-t bg-surface px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-form items-center justify-between gap-3">
          <Button
            label={safeIndex === 0 ? 'Cancel' : 'Back'}
            variant="ghost"
            leadingIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
            onClick={goBack}
          />
          <Button
            label={isLast ? 'Finish' : 'Next'}
            variant="primary"
            disabled={!canProceed}
            loading={submitting}
            trailingIcon={!isLast ? <ArrowRight className="h-4 w-4" aria-hidden /> : undefined}
            onClick={handleNext}
          />
        </div>
      </footer>
    </div>
  );
}
