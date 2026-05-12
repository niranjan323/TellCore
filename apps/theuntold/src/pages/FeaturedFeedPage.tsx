import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '../components/stories/StoryCard';
import { Spinner } from '../components/ui/Spinner';
import { fetchFeaturedFeed } from '../api/stories.api';

type Range = 'today' | 'week' | 'month' | 'all';

const RANGE_TABS: { key: Range; label: string; days: number | null }[] = [
  { key: 'today', label: 'Today', days: 1 },
  { key: 'week', label: 'This week', days: 7 },
  { key: 'month', label: 'This month', days: 30 },
  { key: 'all', label: 'All time', days: null },
];

export function FeaturedFeedPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>('week');
  const { data, isLoading } = useQuery({ queryKey: ['featured-feed'], queryFn: fetchFeaturedFeed });

  const stories = useMemo(() => {
    const all = data ?? [];
    const days = RANGE_TABS.find((t) => t.key === range)?.days ?? null;
    if (!days) return all;
    const cutoff = Date.now() - days * 86_400_000;
    return all.filter((s) => new Date(s.createdAt).getTime() >= cutoff);
  }, [data, range]);

  const [hero, ...rest] = stories;

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-2xl font-semibold text-text-primary md:text-3xl">
          Featured stories
        </h1>
        <div className="flex flex-wrap gap-1.5">
          {RANGE_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setRange(t.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                range === t.key
                  ? 'bg-primary text-surface'
                  : 'bg-surface text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : stories.length === 0 ? (
        <p className="rounded-lg border bg-surface p-10 text-center text-text-secondary">
          No featured stories in this window. Try another range.
        </p>
      ) : (
        <>
          {hero && (
            <StoryCard
              story={hero}
              variant="featured"
              onOpen={(s) => navigate(`/featured/${s.id}`)}
              ctaLabel="Read"
            />
          )}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((s) => (
              <StoryCard
                key={s.id}
                story={s}
                variant="editorial"
                onOpen={(story) => navigate(`/story/${story.id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
