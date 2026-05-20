import { useQuery } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { MilestoneBadge } from '../components/profile/MilestoneBadge';
import { StatTile } from '../components/profile/StatTile';
import { StreakCounter } from '../components/profile/StreakCounter';
import { Spinner } from '../components/ui/Spinner';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { Postmark } from '../components/ui/PaperEphemera';
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
    <div className="space-y-12 animate-page">
      <section className="postcard relative overflow-hidden rounded-[20px] px-6 py-10 text-center md:px-10 md:py-14">
        <div className="absolute inset-0 bg-paper-grain opacity-60" aria-hidden />
        <span className="tape" style={{ top: -10, left: '50%', marginLeft: -42 }} aria-hidden />
        <div className="absolute right-4 top-4 opacity-90">
          <Postmark city={name.split(' ')[0]} dateLabel={new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} />
        </div>

        <div className="relative inline-block">
          <Avatar author={{ name, initials, avatarUrl: null }} size="xl" />
          <div className="absolute -bottom-2 -right-2">
            {streak.data && <StreakCounter days={streak.data.currentDays} size="sm" />}
          </div>
        </div>
        <h1 className="mt-5 font-display text-[28px] font-semibold leading-tight text-text-primary md:text-[36px]">
          {name}
        </h1>
        <p className="mt-1 font-handwritten text-lg text-primary-dark md:text-xl">
          <span className="handline">
            {userType === 'paid'
              ? 'Family vault member'
              : userType === 'registered'
                ? 'Keeper of stories'
                : 'New to the journal'}
          </span>
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" data-stagger>
        {stats.isLoading || !stats.data ? (
          <div className="col-span-full flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <>
            <ScrollReveal variant="rise" index={0}><StatTile value={stats.data.totalStories} label="Stories" /></ScrollReveal>
            <ScrollReveal variant="rise" index={1}><StatTile value={stats.data.daysActive} label="Days active" /></ScrollReveal>
            <ScrollReveal variant="rise" index={2}><StatTile value={stats.data.wordsWritten.toLocaleString()} label="Words written" /></ScrollReveal>
            <ScrollReveal variant="rise" index={3}><StatTile value={stats.data.featuredCount} label="Featured" /></ScrollReveal>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold text-text-primary md:text-2xl">
          <span className="handline">Milestones</span>
        </h2>
        {milestones.isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <ol className="relative ml-2 border-l border-border pl-6" data-stagger>
            {(milestones.data ?? []).map((m, i) => (
              <ScrollReveal as="li" key={m.key} variant="rise" index={i} className="relative mb-3">
                <span className="absolute -left-[26px] top-3 inline-block h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-surface" aria-hidden />
                <MilestoneBadge milestone={m} />
              </ScrollReveal>
            ))}
          </ol>
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
