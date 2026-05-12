import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ClipboardList } from 'lucide-react';
import { ErrorMessage } from '../components/ui/ErrorMessage';
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
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
          My visits
        </h1>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-primary text-surface'
                : 'bg-surface text-text-secondary hover:bg-surface-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg bg-surface p-10 text-center shadow-sm">
          <ClipboardList className="mx-auto h-12 w-12 text-text-hint" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold text-text-primary">
            Nothing here yet
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            Your first visit summary will appear here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.sessionId}>
              <button
                type="button"
                onClick={() => navigate(`/summary/${item.sessionId}`)}
                className="flex w-full items-center gap-4 rounded-md border bg-surface p-4 text-left hover:bg-surface-secondary"
              >
                <div className="flex-1">
                  <div className="text-xs font-medium uppercase tracking-wider text-text-hint">
                    {formatDate(item.createdAt)}
                  </div>
                  <div className="mt-1 line-clamp-1 text-[15px] font-medium text-text-primary">
                    {item.title ?? 'Untitled visit'}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-text-hint" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
