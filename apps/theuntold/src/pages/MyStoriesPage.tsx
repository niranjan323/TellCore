import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Grid3X3, List, PenLine, Search } from 'lucide-react';
import { StoryCard } from '../components/stories/StoryCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { Spinner } from '../components/ui/Spinner';
import { StatCounter } from '../components/ui/StatCounter';
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
          {totalCount > 0 && (
            <p className="mt-2 text-sm text-text-secondary">
              <StatCounter value={totalCount} className="font-semibold text-text-primary" /> pages so far. A few more, and a generation will remember you.
            </p>
          )}
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
        <EmptyState
          illustration={<PenLine className="h-12 w-12" aria-hidden />}
          title="No stories yet"
          description="Your first story will appear here. Five minutes is enough."
          ctaLabel="Write your first story"
          onCta={() => navigate('/today')}
        />
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
