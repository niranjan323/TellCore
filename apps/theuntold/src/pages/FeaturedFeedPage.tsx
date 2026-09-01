import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { StoryCard } from '../components/stories/StoryCard';
import { Spinner } from '../components/ui/Spinner';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { fetchFeaturedFeed, searchStories } from '../api/stories.api';

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
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['featured-feed'], queryFn: fetchFeaturedFeed });

  // Debounce the semantic search so we don't hit the API on every keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 450);
    return () => window.clearTimeout(id);
  }, [query]);

  const search = useQuery({
    queryKey: ['story-search', debounced],
    queryFn: () => searchStories(debounced),
    enabled: debounced.length > 1,
  });
  const searching = debounced.length > 1;

  const stories = useMemo(() => {
    const all = data ?? [];
    const days = RANGE_TABS.find((t) => t.key === range)?.days ?? null;
    if (!days) return all;
    const cutoff = Date.now() - days * 86_400_000;
    return all.filter((s) => new Date(s.createdAt).getTime() >= cutoff);
  }, [data, range]);

  const [hero, ...rest] = stories;

  return (
    <div className="space-y-8 animate-page">
      <header className="flex flex-col gap-4">
        <div>
          <p className="font-handwritten text-xl text-primary-dark md:text-2xl">
            On the community page
          </p>
          <h1 className="mt-1 font-display text-[32px] font-semibold leading-tight tracking-tight text-text-primary md:text-[48px]">
            Featured stories
          </h1>
          <p className="mt-2 max-w-md text-sm text-text-secondary md:text-base">
            Hand-picked from the community — the lines that held strangers still
            for a moment.
          </p>
        </div>
        <label className="grad-border inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 md:max-w-md">
          <Search className="h-4 w-4 text-text-hint" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories in any language — by meaning, not just words"
            className="w-full bg-transparent text-sm outline-none placeholder:text-text-hint"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {RANGE_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setRange(t.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                range === t.key
                  ? 'bg-primary text-surface shadow-[0_8px_18px_-10px_rgba(122,79,48,0.6)]'
                  : 'border border-border bg-surface text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {searching ? (
        search.isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (search.data ?? []).length === 0 ? (
          <p className="postcard rounded-[20px] p-10 text-center text-text-secondary">
            Nothing matched &ldquo;{debounced}&rdquo; yet.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-stagger>
            {(search.data ?? []).map((s, i) => (
              <ScrollReveal key={s.id} variant="rise" index={i} className="lift">
                <StoryCard
                  story={s}
                  variant="editorial"
                  onOpen={(story) => navigate(`/story/${story.id}`)}
                />
              </ScrollReveal>
            ))}
          </div>
        )
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : stories.length === 0 ? (
        <p className="postcard rounded-[20px] p-10 text-center text-text-secondary">
          No featured stories in this window. Try another range.
        </p>
      ) : (
        <>
          {hero && (
            <ScrollReveal variant="scale">
              <StoryCard
                story={hero}
                variant="featured"
                onOpen={(s) => navigate(`/featured/${s.id}`)}
                ctaLabel="Read"
              />
            </ScrollReveal>
          )}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-stagger>
            {rest.map((s, i) => (
              <ScrollReveal key={s.id} variant="rise" index={i} className="lift">
                <StoryCard
                  story={s}
                  variant="editorial"
                  onOpen={(story) => navigate(`/story/${story.id}`)}
                />
              </ScrollReveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
