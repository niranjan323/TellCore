import { Globe2, Heart, Loader2, Mic, ShieldAlert, Sparkles, Users } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';
import type { Story } from '../../types/contracts';

/** Small status/visibility chip shown on the writer's own stories. */
function OwnStoryChip({ story }: { story: Story }) {
  if (!story.isMine) return null;
  if (story.status === 'processing' || story.status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-secondary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-secondary">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Processing
      </span>
    );
  }
  if (story.status === 'flagged') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark">
        <ShieldAlert className="h-3 w-3" aria-hidden />
        Needs a change
      </span>
    );
  }
  if (story.visibility === 'community') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark">
        <Globe2 className="h-3 w-3" aria-hidden />
        Everyone
      </span>
    );
  }
  if (story.visibility === 'family') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-accent/30 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark">
        <Users className="h-3 w-3" aria-hidden />
        Family
      </span>
    );
  }
  return null;
}

export type StoryCardVariant = 'compact' | 'featured' | 'editorial';

interface StoryCardProps {
  story: Story;
  variant?: StoryCardVariant;
  onOpen?: (story: Story) => void;
  ctaLabel?: string;
  className?: string;
}

function formatHandwrittenDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
}

export function StoryCard({
  story,
  variant = 'compact',
  onOpen,
  ctaLabel = 'Read story',
  className,
}: StoryCardProps) {
  const handleOpen = () => onOpen?.(story);

  if (variant === 'featured') {
    return (
      <article
        onClick={handleOpen}
        role={onOpen ? 'button' : undefined}
        tabIndex={onOpen ? 0 : undefined}
        onKeyDown={(e) => {
          if (onOpen && (e.key === 'Enter' || e.key === ' ')) handleOpen();
        }}
        className={`group relative overflow-hidden rounded-lg border bg-surface p-6 transition-shadow hover:shadow-md md:p-8 ${
          onOpen ? 'cursor-pointer' : ''
        } ${className ?? ''}`}
      >
        <div className="absolute inset-0 bg-paper-grain opacity-60" aria-hidden />
        <div className="relative">
          {story.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/40 px-2.5 py-0.5 text-xs font-semibold text-primary-dark">
              <Sparkles className="h-3 w-3" aria-hidden />
              Story of the day
            </span>
          )}
          <div className="mt-4 flex items-center gap-3">
            <Avatar author={story.author} size="md" />
            <div>
              <div className="text-sm font-medium text-text-primary">{story.author.name}</div>
              <div className="font-handwritten text-base text-text-secondary">
                {formatHandwrittenDate(story.createdAt)}
              </div>
            </div>
          </div>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-text-primary md:text-[36px]">
            {story.title}
          </h2>
          <p className="decorative-quote mt-4 max-w-prose font-display text-[17px] leading-relaxed text-text-secondary md:text-[18px]">
            {story.excerpt}
          </p>
          <div className="mt-6 flex items-center gap-2">
            {story.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
          {onOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpen();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-primary-dark"
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </article>
    );
  }

  if (variant === 'editorial') {
    return (
      <article
        onClick={handleOpen}
        role={onOpen ? 'button' : undefined}
        tabIndex={onOpen ? 0 : undefined}
        onKeyDown={(e) => {
          if (onOpen && (e.key === 'Enter' || e.key === ' ')) handleOpen();
        }}
        className={`group flex h-full flex-col rounded-md border bg-surface p-5 transition-shadow hover:shadow-md ${
          onOpen ? 'cursor-pointer' : ''
        } ${className ?? ''}`}
      >
        <div className="mb-3 flex items-center justify-between">
          <Avatar author={story.author} size="sm" />
          <span className="font-handwritten text-sm text-text-secondary">
            {formatHandwrittenDate(story.createdAt)}
          </span>
        </div>
        <h3 className="font-display text-xl font-semibold leading-snug text-text-primary md:text-2xl">
          {story.title}
        </h3>
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-text-secondary">
          {story.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {story.tags.slice(0, 2).map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-text-hint">
            <Heart className="h-3.5 w-3.5" aria-hidden />
            {story.heartCount}
          </span>
        </div>
      </article>
    );
  }

  // compact
  return (
    <article
      onClick={handleOpen}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(e) => {
        if (onOpen && (e.key === 'Enter' || e.key === ' ')) handleOpen();
      }}
      className={`flex w-full items-start gap-3 rounded-md border bg-surface p-4 text-left transition-colors hover:bg-surface-secondary ${
        onOpen ? 'cursor-pointer' : ''
      } ${className ?? ''}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {story.kind === 'voice' && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-light text-primary-dark">
              <Mic className="h-3 w-3" aria-hidden />
            </span>
          )}
          <span className="font-handwritten text-sm text-text-secondary">
            {formatHandwrittenDate(story.createdAt)}
          </span>
          <OwnStoryChip story={story} />
        </div>
        <h4 className="mt-1 truncate font-display text-lg font-semibold text-text-primary">
          {story.title}
        </h4>
        <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{story.excerpt}</p>
      </div>
    </article>
  );
}
