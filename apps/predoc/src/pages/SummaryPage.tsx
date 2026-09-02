import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RotateCcw, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Spinner } from '../components/ui/Spinner';
import { SummaryView } from '../components/summary/SummaryView';
import { PdfExport } from '../components/summary/PdfExport';
import { getSummary } from '../api/responses.api';
import { useSessionStore } from '../store/sessionStore';
import { useNavigation } from '../hooks/useNavigation';

export function SummaryPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const cachedSummary = useSessionStore((s) => s.summary);
  const resetSession = useSessionStore((s) => s.reset);
  const nav = useNavigation();

  const canExportPdf = (nav.data?.items ?? []).some(
    (i) => i.key === 'export' || i.key === 'pdf' || i.key === 'paid',
  );

  const query = useQuery({
    queryKey: ['summary', sessionId],
    queryFn: () => getSummary(sessionId!),
    enabled: !!sessionId && (!cachedSummary || cachedSummary.sessionId !== sessionId),
    initialData:
      cachedSummary && sessionId && cachedSummary.sessionId === sessionId
        ? cachedSummary
        : undefined,
  });

  const summary = query.data;
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) navigate('/', { replace: true });
  }, [sessionId, navigate]);

  async function handleShare() {
    if (!summary) return;
    const text = `${summary.title}\n\n${summary.sections
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s) => `${s.title}\n${s.body}`)
      .join('\n\n')}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: summary.title, text });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareMessage('Copied to clipboard');
      setTimeout(() => setShareMessage(null), 2200);
    } catch {
      setShareMessage('Sharing is not available on this device');
    }
  }

  function handleStartOver() {
    resetSession();
    navigate('/', { replace: true });
  }

  if (query.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (query.isError || !summary) {
    return (
      <div className="mx-auto max-w-page">
        <ErrorMessage
          message="We couldn't load your summary. Please try again."
          retry={() => query.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-page animate-page py-4 md:py-8">
      <SummaryView summary={summary} />

      <div className="mt-7 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <Button
          label="Share"
          variant="primary"
          leadingIcon={<Share2 className="h-4 w-4" aria-hidden />}
          onClick={handleShare}
          fullWidth
        />
        {canExportPdf ? (
          <PdfExport summary={summary} />
        ) : (
          <span className="hidden md:block" />
        )}
        <Button
          label="Start over"
          variant="ghost"
          leadingIcon={<RotateCcw className="h-4 w-4" aria-hidden />}
          onClick={handleStartOver}
          fullWidth
        />
      </div>

      {shareMessage && (
        <div
          role="status"
          className="mt-4 animate-page rounded-md bg-primary-light px-4 py-2 text-center text-sm font-medium text-primary-dark"
        >
          {shareMessage}
        </div>
      )}
    </div>
  );
}
