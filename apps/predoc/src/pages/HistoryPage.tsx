import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ClipboardList } from 'lucide-react';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { Spinner } from '../components/ui/Spinner';
import { getMySessions } from '../api/users.api';
import { useAuthStore } from '../store/authStore';

type FilterKey = 'all' | '30d' | '90d' | 'year';

const FILTERS: { key: FilterKey; label: string; days: number | null }[] = [
  { key: 'all', label: 'All', days: null },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: '90d', label: 'Last 90 days', days: 90 },
  { key: 'year', label: 'This year', days: 365 },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function HistoryPage() {
  const navigate = useNavigate();
  const userType = useAuthStore((s) => s.userType);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [filter, setFilter] = useState<FilterKey>('all');

  const query = useQuery({
    queryKey: ['sessions', 'mine'],
    queryFn: getMySessions,
    enabled: !!accessToken && userType !== 'guest',
  });

  const items = useMemo(() => {
    const raw = query.data?.sessions ?? [];
    const days = FILTERS.find((f) => f.key === filter)?.days ?? null;
    const cutoff = days ? Date.now() - days * 86_400_000 : null;
    return raw
      .filter((s) => (cutoff ? new Date(s.createdAt).getTime() >= cutoff : true))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [query.data, filter]);

  if (userType === 'guest') {
    return (
      <div className="mx-auto max-w-form rounded-lg bg-surface p-8 text-center shadow-sm">
        <ClipboardList className="mx-auto h-10 w-10 text-text-hint" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold text-text-primary">
          Sign in to see your visits
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          History is available for registered users.
        </p>
      </div>
    );
  }

  if (query.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorMessage
        message="We couldn't load your history. Please try again."
        retry={() => query.refetch()}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6 animate-page">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
          Your timeline
        </p>
        <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight text-text-primary md:text-[40px]">
          My visits
        </h1>
        <p className="mt-1 text-sm text-text-secondary md:text-base">
          A record of every conversation you&apos;ve prepared for.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-primary text-surface shadow-[0_8px_18px_-10px_rgba(15,110,86,0.55)]'
                : 'border border-border bg-surface text-text-secondary hover:bg-surface-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="glass-card rounded-[20px] p-12 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-text-hint" aria-hidden />
          <h2 className="mt-4 font-display text-xl font-semibold text-text-primary">
            Nothing here yet
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            Your first visit summary will appear here.
          </p>
        </div>
      ) : (
        <ol className="relative ml-3 border-l border-border pl-7" data-stagger>
          {items.map((item, idx) => (
            <ScrollReveal
              as="li"
              key={item.sessionId}
              variant="rise"
              index={idx}
              className="relative mb-4 last:mb-0"
            >
              {/* Timeline dot */}
              <span
                className="absolute -left-[34px] top-5 inline-block h-3 w-3 rounded-full bg-primary ring-4 ring-surface"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => navigate(`/summary/${item.sessionId}`)}
                className="lift grad-border flex w-full items-center gap-4 rounded-[16px] bg-surface p-4 text-left md:p-5"
              >
                <div className="flex-1">
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-dark">
                    {formatDate(item.createdAt)}
                  </div>
                  <div className="mt-1 line-clamp-1 font-display text-lg font-semibold text-text-primary md:text-xl">
                    {item.title ?? 'Untitled visit'}
                  </div>
                  <div className="mt-1 text-xs text-text-secondary">
                    {item.status} · {item.languageCode.toUpperCase()}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
              </button>
            </ScrollReveal>
          ))}
        </ol>
      )}
    </div>
  );
}
