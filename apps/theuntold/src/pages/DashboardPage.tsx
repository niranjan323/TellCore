import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { StoryCard } from '../components/stories/StoryCard';
import { StreakCounter } from '../components/profile/StreakCounter';
import { Spinner } from '../components/ui/Spinner';
import {
  fetchFeaturedStory,
  fetchMyStories,
  fetchRecentStories,
  fetchStreak,
} from '../api/stories.api';
import { useAuthStore } from '../store/authStore';
import { usePrompt } from '../hooks/usePrompt';

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

  return (
    <div className="animate-ink-fade space-y-10 md:space-y-12">
      {/* Greeting */}
      <section className="flex items-start justify-between gap-4">
        <div>
          <p className="font-handwritten text-xl text-text-secondary md:text-2xl">
            {prompt.dateLabel}
          </p>
          <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight tracking-tight text-text-primary md:text-[36px]">
            {greeting()}, {firstName}.
          </h1>
        </div>
        {streak.data && <StreakCounter days={streak.data.currentDays} size="md" />}
      </section>

      {/* Today's prompt */}
      <section className="relative overflow-hidden rounded-lg border bg-primary-light p-6 md:p-8">
        <div className="absolute inset-0 bg-paper-grain opacity-70" aria-hidden />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-dark">
            Today&apos;s prompt
          </p>
          <p className="mt-3 font-display text-[22px] leading-snug text-text-primary md:text-[28px]">
            {prompt.question}
          </p>
          {prompt.helper && (
            <p className="mt-2 font-handwritten text-lg text-primary-dark">{prompt.helper}</p>
          )}
          <button
            type="button"
            onClick={() => navigate('/today')}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-primary-dark"
          >
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
