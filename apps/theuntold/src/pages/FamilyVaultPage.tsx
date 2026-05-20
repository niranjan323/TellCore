import { useQuery } from '@tanstack/react-query';
import { Mail, Shield, UserPlus } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { Stamp } from '../components/ui/PaperEphemera';
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
    <div className="space-y-12 animate-page">
      <header className="postcard relative overflow-hidden rounded-[20px] p-6 md:p-10">
        <div className="absolute inset-0 bg-paper-grain opacity-60" aria-hidden />
        <Stamp className="absolute right-6 top-6" rotate={9}>Vault</Stamp>
        <p className="font-handwritten text-xl text-primary-dark md:text-2xl">
          Sealed for the people who come after.
        </p>
        <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight text-text-primary md:text-[40px]">
          Shared with family
        </h1>
        <p className="mt-2 max-w-md text-sm text-text-secondary md:text-base">
          A private corner for the ones you love — and the future ones who&apos;ll
          want to know you.
        </p>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-text-primary md:text-xl">
            <span className="handline">Family members</span>
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
          <ul className="flex flex-col gap-2.5" data-stagger>
            {(members.data ?? []).map((m, i) => (
              <ScrollReveal
                as="li"
                key={m.id}
                variant="rise"
                index={i}
                className="lift flex items-center gap-3 rounded-[14px] border bg-surface p-4"
              >
                <Avatar
                  author={{
                    name: m.name,
                    initials: m.name.slice(0, 2).toUpperCase(),
                    avatarUrl: m.avatarUrl,
                  }}
                />
                <div className="flex-1">
                  <div className="font-display text-base font-semibold text-text-primary">
                    {m.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Mail className="h-3 w-3" aria-hidden />
                    {m.email}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                    m.status === 'active'
                      ? 'bg-primary-light text-primary-dark'
                      : 'bg-surface-secondary text-text-secondary'
                  }`}
                >
                  {m.status}
                </span>
              </ScrollReveal>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-text-primary md:text-xl">
          <span className="handline">Time capsules</span>
        </h2>
        {capsules.isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <ol className="flex flex-col gap-3" data-stagger>
            {(capsules.data ?? []).map((c, i) => (
              <ScrollReveal
                as="li"
                key={c.id}
                variant="rise"
                index={i}
                className="postcard relative overflow-hidden rounded-[16px] p-5"
              >
                <Stamp className="absolute right-4 top-4" rotate={-7}>
                  Locked
                </Stamp>
                <span className="absolute left-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/40 text-primary-dark animate-warm-glow">
                  <Shield className="h-5 w-5" aria-hidden />
                </span>
                <div className="ml-14 pr-20">
                  <p className="font-display text-lg font-semibold text-text-primary md:text-xl">
                    {c.title}
                  </p>
                  <p className="mt-1 font-handwritten text-base text-text-secondary md:text-lg">
                    Unlocks{' '}
                    {new Date(c.unlocksOn).toLocaleDateString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    })}
                    {' · '}
                    {c.storyIds.length}{' '}
                    {c.storyIds.length === 1 ? 'story' : 'stories'}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
