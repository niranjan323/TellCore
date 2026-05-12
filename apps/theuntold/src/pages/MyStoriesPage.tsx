import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Grid3X3, List, PenLine, Search } from 'lucide-react';
import { StoryCard } from '../components/stories/StoryCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { fetchMyStories } from '../api/stories.api';
import type { Story } from '../types/contracts';

const TAG_FILTERS = ['all', 'family', 'childhood', 'love', 'lesson', 'joy', 'regret'];

export function MyStoriesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('list');

  const { data, isLoading } = useQuery({ queryKey: ['my-stories'], queryFn: fetchMyStories });

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

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-semibold text-text-primary md:text-3xl">
          My stories
        </h1>
        <div className="hidden gap-1 rounded-md bg-surface-secondary p-1 md:flex">
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
        <label className="inline-flex flex-1 items-center gap-2 rounded-md border bg-surface px-3 py-2">
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
              className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors ${
                filter === t
                  ? 'bg-primary text-surface'
                  : 'bg-surface text-text-secondary hover:bg-surface-secondary'
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
        <EmptyState
          illustration={<PenLine className="h-12 w-12" aria-hidden />}
          title="No stories yet"
          description="Your first story will appear here. Five minutes is enough."
          ctaLabel="Write your first story"
          onCta={() => navigate('/today')}
        />
      ) : view === 'list' ? (
        <div className="flex flex-col gap-3">
          {filtered.map((s) => (
            <StoryCard
              key={s.id}
              story={s}
              variant="compact"
              onOpen={(story) => navigate(`/story/${story.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <StoryCard
              key={s.id}
              story={s}
              variant="editorial"
              onOpen={(story) => navigate(`/story/${story.id}`)}
            />
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
