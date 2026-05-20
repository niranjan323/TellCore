import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, PenLine } from 'lucide-react';
import { StoryCard } from '../components/stories/StoryCard';
import { StreakCounter } from '../components/profile/StreakCounter';
import { Spinner } from '../components/ui/Spinner';
import { WordReveal } from '../components/ui/WordReveal';
import {
  fetchFeaturedStory,
  fetchMyStories,
  fetchRecentStories,
  fetchStreak,
} from '../api/stories.api';
import { useAuthStore } from '../store/authStore';
import { usePrompt } from '../hooks/usePrompt';
import { useMagnetic } from '../hooks/useMagnetic';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still up?';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Good night';
}

export function DashboardPage() {
  const navigate = useNavigate();
  const userType = useAuthStore((s) => s.userType);
  const email = useAuthStore((s) => s.email);
  const { prompt } = usePrompt();

  const featured = useQuery({ queryKey: ['story-of-day'], queryFn: fetchFeaturedStory });
  const recents = useQuery({ queryKey: ['recent-stories'], queryFn: fetchRecentStories });
  const streak = useQuery({ queryKey: ['streak'], queryFn: fetchStreak });
  const mine = useQuery({
    queryKey: ['my-stories', userType],
    queryFn: fetchMyStories,
    enabled: userType !== 'guest',
  });

  const firstName = email?.split('@')[0]?.replace(/[._-]/g, ' ').replace(/(^| )\w/g, (c) => c.toUpperCase()) ?? 'friend';
  const magneticRef = useMagnetic<HTMLButtonElement>(0.15);

  return (
    <div className="animate-ink-fade space-y-10 md:space-y-12">
      {/* Greeting — editorial header with handwritten date */}
      <section className="flex items-start justify-between gap-4">
        <div>
          <p className="font-handwritten text-xl text-text-secondary md:text-2xl">
            {prompt.dateLabel}
          </p>
          <h1 className="mt-1 font-display text-[32px] font-semibold leading-[1.02] tracking-tight text-text-primary md:text-[44px]">
            <WordReveal text={`${greeting()},`} as="span" className="block" />
            <WordReveal
              text={`${firstName}.`}
              as="span"
              className="block italic text-primary-dark"
              delay={0.14}
            />
          </h1>
        </div>
        {streak.data && <StreakCounter days={streak.data.currentDays} size="md" />}
      </section>

      {/* Today's prompt — bento with mesh + paper grain depth */}
      <section className="relative overflow-hidden rounded-[20px] border bg-primary-light p-6 md:p-9">
        <div className="absolute inset-0 mesh-warm opacity-90" aria-hidden />
        <div className="absolute inset-0 bg-paper-grain opacity-70" aria-hidden />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-dark backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Today&apos;s prompt
          </p>
          <p className="mt-4 font-display text-[24px] leading-snug text-text-primary md:text-[32px] lg:text-[36px]">
            <WordReveal text={prompt.question} as="span" />
          </p>
          {prompt.helper && (
            <p className="mt-3 font-handwritten text-lg text-primary-dark md:text-xl">
              {prompt.helper}
            </p>
          )}
          <button
            ref={magneticRef}
            type="button"
            onClick={() => navigate('/today')}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-surface shadow-[0_10px_24px_-12px_rgba(122,79,48,0.55)] transition-colors hover:bg-primary-dark"
          >
            <PenLine className="h-4 w-4" aria-hidden />
            Tell this story
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </section>

      {/* Story of the day */}
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold text-text-primary md:text-2xl">
          Story of the day
        </h2>
        {featured.isLoading || !featured.data ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <StoryCard
            story={featured.data}
            variant="featured"
            onOpen={(s) => navigate(`/story/${s.id}`)}
          />
        )}
      </section>

      {/* Recent community stories */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-text-primary md:text-2xl">
            Recent stories
          </h2>
          <button
            type="button"
            onClick={() => navigate('/featured')}
            className="text-sm font-medium text-primary-dark hover:underline"
          >
            See all
          </button>
        </div>
        {recents.isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-3">
            {(recents.data ?? []).map((s) => (
              <div key={s.id} className="min-w-[280px] md:min-w-0">
                <StoryCard
                  story={s}
                  variant="editorial"
                  onOpen={(story) => navigate(`/story/${story.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Your library */}
      {userType !== 'guest' && (
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold text-text-primary md:text-2xl">
              Your library
            </h2>
            <button
              type="button"
              onClick={() => navigate('/stories')}
              className="text-sm font-medium text-primary-dark hover:underline"
            >
              View all
            </button>
          </div>
          {mine.isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(mine.data ?? []).slice(0, 3).map((s) => (
                <StoryCard
                  key={s.id}
                  story={s}
                  variant="compact"
                  onOpen={(story) => navigate(`/story/${story.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
