import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Crown, Eye, EyeOff, LogOut, Sparkles, UserRound } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { MilestoneBadge } from '../components/profile/MilestoneBadge';
import { StatTile } from '../components/profile/StatTile';
import { StreakCounter } from '../components/profile/StreakCounter';
import { Spinner } from '../components/ui/Spinner';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { Postmark } from '../components/ui/PaperEphemera';
import { Toast } from '../components/ui/Toast';
import { logout as apiLogout } from '../api/auth.api';
import {
  createPortalSession,
  fetchBillingStatus,
  fetchMilestones,
  fetchProfileStats,
  fetchStreak,
} from '../api/stories.api';
import { getMe, updatePrivacy } from '../api/users.api';
import { useAuthStore } from '../store/authStore';

const USER_TYPE_LABEL = { guest: 'Guest', registered: 'Free account', paid: 'Premium member' } as const;

export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const email = useAuthStore((s) => s.email);
  const userType = useAuthStore((s) => s.userType);
  const [toast, setToast] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const me = useQuery({ queryKey: ['me'], queryFn: getMe });
  const billing = useQuery({ queryKey: ['billing-status'], queryFn: fetchBillingStatus });
  const stats = useQuery({ queryKey: ['profile-stats'], queryFn: fetchProfileStats });
  const milestones = useQuery({ queryKey: ['milestones'], queryFn: fetchMilestones });
  const streak = useQuery({ queryKey: ['streak'], queryFn: fetchStreak });

  const effectiveType = me.data?.userType ?? userType ?? 'guest';
  const displayEmail = me.data?.email ?? email;
  const name =
    me.data?.name ??
    displayEmail?.split('@')[0]?.replace(/[._-]/g, ' ').replace(/(^| )\w/g, (c) => c.toUpperCase()) ??
    'You';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleTogglePrivacy() {
    const next = !(me.data?.isProfilePublic ?? true);
    try {
      await updatePrivacy(next);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      setToast(next ? 'Your name now shows on community stories' : 'You now appear as "A storyteller"');
    } catch {
      setToast("Couldn't update privacy right now");
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const session = await createPortalSession();
      window.location.href = session.url;
    } catch {
      setPortalLoading(false);
      setToast('Subscription management is unavailable right now');
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    const { refreshToken, clear } = useAuthStore.getState();
    try {
      if (refreshToken) await apiLogout(refreshToken);
    } catch {
      // sign out locally regardless
    }
    clear();
    queryClient.clear();
    navigate('/welcome', { replace: true });
  }

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
        <h2 className="mb-4 font-display text-xl font-semibold text-text-primary md:text-2xl">
          <span className="handline">Account</span>
        </h2>
        <div className="space-y-3">
          {/* Who you are */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border bg-surface p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary-dark">
                <UserRound className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {USER_TYPE_LABEL[effectiveType]}
                </p>
                <p className="text-xs text-text-secondary">
                  {displayEmail ?? 'Not linked to an email yet'}
                </p>
              </div>
            </div>
            {effectiveType === 'guest' && (
              <Button
                label="Sign in or create account"
                variant="primary"
                onClick={() => navigate('/auth')}
              />
            )}
          </div>

          {/* Membership */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border bg-surface p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/30 text-primary-dark">
                {effectiveType === 'paid'
                  ? <Crown className="h-4 w-4" aria-hidden />
                  : <Sparkles className="h-4 w-4" aria-hidden />}
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {effectiveType === 'paid' ? 'Premium' : 'Free plan'}
                </p>
                <p className="text-xs text-text-secondary">
                  {effectiveType === 'paid'
                    ? billing.data?.currentPeriodEnd
                      ? `Renews ${new Date(billing.data.currentPeriodEnd).toLocaleDateString()}`
                      : 'Active membership'
                    : 'Previews of community stories · limited stories'}
                </p>
              </div>
            </div>
            {effectiveType === 'paid' ? (
              <Button
                label="Manage subscription"
                variant="secondary"
                loading={portalLoading}
                onClick={handleManageSubscription}
              />
            ) : (
              <Link
                to="/upgrade"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-surface transition-colors hover:bg-primary-dark"
              >
                Upgrade
              </Link>
            )}
          </div>

          {/* Public / private profile */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border bg-surface p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary text-text-secondary">
                {(me.data?.isProfilePublic ?? true)
                  ? <Eye className="h-4 w-4" aria-hidden />
                  : <EyeOff className="h-4 w-4" aria-hidden />}
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {(me.data?.isProfilePublic ?? true) ? 'Public profile' : 'Private profile'}
                </p>
                <p className="text-xs text-text-secondary">
                  {(me.data?.isProfilePublic ?? true)
                    ? 'Your name appears on stories you share with everyone'
                    : 'Community stories show you as "A storyteller"'}
                </p>
              </div>
            </div>
            <Button
              label={(me.data?.isProfilePublic ?? true) ? 'Go private' : 'Go public'}
              variant="ghost"
              onClick={handleTogglePrivacy}
            />
          </div>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </section>

      {toast && <Toast message={toast} kind="info" onDismiss={() => setToast(null)} />}
    </div>
  );
}
