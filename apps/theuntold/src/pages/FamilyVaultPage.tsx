import { useQuery } from '@tanstack/react-query';
import { Mail, Shield, UserPlus } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { fetchFamilyMembers, fetchTimeCapsules } from '../api/stories.api';
import { useAuthStore } from '../store/authStore';

export function FamilyVaultPage() {
  const userType = useAuthStore((s) => s.userType);
  const members = useQuery({ queryKey: ['family'], queryFn: fetchFamilyMembers });
  const capsules = useQuery({ queryKey: ['capsules'], queryFn: fetchTimeCapsules });

  if (userType !== 'paid') {
    return (
      <div className="mx-auto max-w-md rounded-lg border bg-surface p-10 text-center">
        <Shield className="mx-auto h-10 w-10 text-text-hint" aria-hidden />
        <h2 className="mt-4 font-display text-xl font-semibold text-text-primary">
          Family vault is for members
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          The vault lets you share stories privately with family and schedule time capsules
          for the future.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-2xl font-semibold text-text-primary md:text-3xl">
          Shared with family
        </h1>
        <p className="mt-1 font-handwritten text-lg text-text-secondary">
          The people who will hold these stories one day.
        </p>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-text-primary md:text-xl">
            Family members
          </h2>
          <Button
            label="Add family member"
            variant="secondary"
            leadingIcon={<UserPlus className="h-4 w-4" aria-hidden />}
            onClick={() => {
              /* would open the invite flow */
            }}
          />
        </div>
        {members.isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {(members.data ?? []).map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-md border bg-surface p-4"
              >
                <Avatar author={{ name: m.name, initials: m.name.slice(0, 2).toUpperCase(), avatarUrl: m.avatarUrl }} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">{m.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Mail className="h-3 w-3" aria-hidden />
                    {m.email}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider ${
                    m.status === 'active'
                      ? 'bg-primary-light text-primary-dark'
                      : 'bg-surface-secondary text-text-secondary'
                  }`}
                >
                  {m.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-text-primary md:text-xl">
          Time capsules
        </h2>
        {capsules.isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {(capsules.data ?? []).map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-3 rounded-md border bg-surface p-4"
              >
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-accent/40 text-primary-dark">
                  <Shield className="h-4 w-4" aria-hidden />
                </span>
                <div className="flex-1">
                  <p className="font-display text-base text-text-primary">{c.title}</p>
                  <p className="font-handwritten text-base text-text-secondary">
                    Unlocks{' '}
                    {new Date(c.unlocksOn).toLocaleDateString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    })}
                    {' · '}
                    {c.storyIds.length} {c.storyIds.length === 1 ? 'story' : 'stories'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
