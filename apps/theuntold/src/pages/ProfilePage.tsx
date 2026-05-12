import { useQuery } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { MilestoneBadge } from '../components/profile/MilestoneBadge';
import { StatTile } from '../components/profile/StatTile';
import { StreakCounter } from '../components/profile/StreakCounter';
import { Spinner } from '../components/ui/Spinner';
import { fetchMilestones, fetchProfileStats, fetchStreak } from '../api/stories.api';
import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const email = useAuthStore((s) => s.email);
  const userType = useAuthStore((s) => s.userType);

  const stats = useQuery({ queryKey: ['profile-stats'], queryFn: fetchProfileStats });
  const milestones = useQuery({ queryKey: ['milestones'], queryFn: fetchMilestones });
  const streak = useQuery({ queryKey: ['streak'], queryFn: fetchStreak });

  const name = email?.split('@')[0]?.replace(/[._-]/g, ' ').replace(/(^| )\w/g, (c) => c.toUpperCase()) ?? 'You';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-10">
      <section className="flex flex-col items-center text-center">
        <div className="relative">
          <Avatar author={{ name, initials, avatarUrl: null }} size="xl" />
          <div className="absolute -bottom-2 -right-2">
            {streak.data && <StreakCounter days={streak.data.currentDays} size="sm" />}
          </div>
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-text-primary md:text-3xl">
          {name}
        </h1>
        <p className="mt-1 font-handwritten text-lg text-text-secondary">
          {userType === 'paid'
            ? 'Family vault member'
            : userType === 'registered'
              ? 'Keeper of stories'
              : 'New to the journal'}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.isLoading || !stats.data ? (
          <div className="col-span-full flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <>
            <StatTile value={stats.data.totalStories} label="Stories" />
            <StatTile value={stats.data.daysActive} label="Days active" />
            <StatTile value={stats.data.wordsWritten.toLocaleString()} label="Words written" />
            <StatTile value={stats.data.featuredCount} label="Featured" />
          </>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-text-primary md:text-2xl">
          Milestones
        </h2>
        {milestones.isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {(milestones.data ?? []).map((m) => (
              <MilestoneBadge key={m.key} milestone={m} />
            ))}
          </div>
        )}
      </section>

      <section>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
        >
          <Settings className="h-4 w-4" aria-hidden />
          Settings
        </button>
      </section>
    </div>
  );
}
