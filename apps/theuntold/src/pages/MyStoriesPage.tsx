import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, Grid3X3, Heart, List, PenLine, Search } from 'lucide-react';
import { StoryCard } from '../components/stories/StoryCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { Spinner } from '../components/ui/Spinner';
import { StatCounter } from '../components/ui/StatCounter';
import { fetchFavouriteStories, fetchLikedStories, fetchMyStories } from '../api/stories.api';
import type { Story } from '../types/contracts';

const TAG_FILTERS = ['all', 'family', 'childhood', 'love', 'lesson', 'joy', 'regret'];

type Shelf = 'mine' | 'liked' | 'saved';

const SHELVES: { key: Shelf; label: string }[] = [
  { key: 'mine', label: 'My pages' },
  { key: 'liked', label: 'Liked' },
  { key: 'saved', label: 'Saved' },
];

const SHELF_FETCHERS: Record<Shelf, () => Promise<Story[]>> = {
  mine: fetchMyStories,
  liked: fetchLikedStories,
  saved: fetchFavouriteStories,
};

const SHELF_QUERY_KEYS: Record<Shelf, string> = {
  mine: 'my-stories',
  liked: 'liked-stories',
  saved: 'favourite-stories',
};

export function MyStoriesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [shelf, setShelf] = useState<Shelf>('mine');

  const { data, isLoading } = useQuery({
    queryKey: [SHELF_QUERY_KEYS[shelf]],
    queryFn: SHELF_FETCHERS[shelf],
  });

  const filtered: Story[] = useMemo(() => {
    const raw = data ?? [];
    return raw
      .filter((s) => (filter === 'all' ? true : s.tags.includes(filter)))
      .filter((s) =>
        query.trim() === ''
          ? true
          : (s.title + ' ' + s.excerpt + ' ' + s.body).toLowerCase().includes(query.toLowerCase()),
      );
  }, [data, filter, query]);

  const totalCount = data?.length ?? 0;

  return (
    <div className="space-y-7 animate-page">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-handwritten text-xl text-primary-dark md:text-2xl">
            Your library
          </p>
          <h1 className="mt-1 font-display text-[32px] font-semibold leading-tight tracking-tight text-text-primary md:text-[44px]">
            My stories
          </h1>
          {shelf === 'mine' && totalCount > 0 && (
            <p className="mt-2 text-sm text-text-secondary">
              <StatCounter value={totalCount} className="font-semibold text-text-primary" /> pages so far. A few more, and a generation will remember you.
            </p>
          )}
          <div className="mt-4 inline-flex gap-1 rounded-full border border-border bg-surface p-1">
            {SHELVES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setShelf(s.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  shelf === s.key
                    ? 'bg-primary text-surface'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {s.key === 'liked' && <Heart className="h-3.5 w-3.5" aria-hidden />}
                {s.key === 'saved' && <Bookmark className="h-3.5 w-3.5" aria-hidden />}
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden gap-1 rounded-md bg-surface-secondary p-1 md:inline-flex">
          <ViewToggleButton
            active={view === 'list'}
            onClick={() => setView('list')}
            icon={<List className="h-4 w-4" aria-hidden />}
            label="List"
          />
          <ViewToggleButton
            active={view === 'grid'}
            onClick={() => setView('grid')}
            icon={<Grid3X3 className="h-4 w-4" aria-hidden />}
            label="Grid"
          />
        </div>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="grad-border inline-flex flex-1 items-center gap-2 rounded-full bg-surface px-4 py-2.5">
          <Search className="h-4 w-4 text-text-hint" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your stories"
            className="w-full bg-transparent text-sm outline-none placeholder:text-text-hint"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TAG_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                filter === t
                  ? 'bg-primary text-surface shadow-[0_8px_18px_-10px_rgba(122,79,48,0.6)]'
                  : 'border border-border bg-surface text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        shelf === 'mine' ? (
          <EmptyState
            illustration={<PenLine className="h-12 w-12" aria-hidden />}
            title="No stories yet"
            description="Your first story will appear here. Five minutes is enough."
            ctaLabel="Write your first story"
            onCta={() => navigate('/today')}
          />
        ) : (
          <EmptyState
            illustration={
              shelf === 'liked'
                ? <Heart className="h-12 w-12" aria-hidden />
                : <Bookmark className="h-12 w-12" aria-hidden />
            }
            title={shelf === 'liked' ? 'No liked stories yet' : 'Nothing saved yet'}
            description={
              shelf === 'liked'
                ? 'Stories you hold close will gather here.'
                : 'Save stories you want to return to — they wait for you here.'
            }
            ctaLabel="Browse featured stories"
            onCta={() => navigate('/featured')}
          />
        )
      ) : view === 'list' ? (
        <ol className="flex flex-col gap-3" data-stagger>
          {filtered.map((s, i) => (
            <ScrollReveal as="li" key={s.id} variant="rise" index={i}>
              <StoryCard
                story={s}
                variant="compact"
                onOpen={(story) => navigate(`/story/${story.id}`)}
              />
            </ScrollReveal>
          ))}
        </ol>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-stagger>
          {filtered.map((s, i) => (
            <ScrollReveal key={s.id} variant="rise" index={i} className="lift">
              <StoryCard
                story={s}
                variant="editorial"
                onOpen={(story) => navigate(`/story/${story.id}`)}
              />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}

function ViewToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
        active ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
