import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Copy, Mail, Share2, Shield, UserPlus } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { Stamp } from '../components/ui/PaperEphemera';
import { StoryCard } from '../components/stories/StoryCard';
import { Toast } from '../components/ui/Toast';
import {
  createVaultInvite,
  fetchFamilyMembers,
  fetchTimeCapsules,
  fetchVaultStories,
} from '../api/stories.api';
import { useAuthStore } from '../store/authStore';

export function FamilyVaultPage() {
  const navigate = useNavigate();
  const userType = useAuthStore((s) => s.userType);
  const members = useQuery({ queryKey: ['family'], queryFn: fetchFamilyMembers });
  const capsules = useQuery({ queryKey: ['capsules'], queryFn: fetchTimeCapsules });
  const vaultStories = useQuery({ queryKey: ['vault-stories'], queryFn: fetchVaultStories });
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleCreateInvite() {
    setCreating(true);
    try {
      const invite = await createVaultInvite();
      setInviteUrl(invite.inviteUrl);
    } catch {
      setToast("Couldn't create an invite right now — try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleShareInvite() {
    if (!inviteUrl) return;
    const message = `I keep my life stories in a family vault on TheUntold. This link lets you in: ${inviteUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ text: message });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    await copyInvite();
  }

  async function copyInvite() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setToast('Invite link copied');
    } catch {
      setToast("Couldn't copy on this device");
    }
  }

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
        <Link
          to="/upgrade"
          className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-primary-dark"
        >
          Unlock with Premium
        </Link>
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
            loading={creating}
            leadingIcon={<UserPlus className="h-4 w-4" aria-hidden />}
            onClick={handleCreateInvite}
          />
        </div>
        {inviteUrl && (
          <div className="postcard mb-4 rounded-[16px] p-5">
            <p className="font-handwritten text-lg text-primary-dark">
              Send this link to one family member — it works once and expires in 7 days.
            </p>
            <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
              <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-md border bg-surface px-3 py-2 text-xs text-text-secondary">
                {inviteUrl}
              </code>
              <div className="flex gap-2">
                <Button
                  label="Copy"
                  variant="secondary"
                  leadingIcon={<Copy className="h-4 w-4" aria-hidden />}
                  onClick={copyInvite}
                />
                <Button
                  label="Share"
                  variant="primary"
                  leadingIcon={<Share2 className="h-4 w-4" aria-hidden />}
                  onClick={handleShareInvite}
                />
              </div>
            </div>
          </div>
        )}
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
          <span className="handline">Shared stories</span>
        </h2>
        {vaultStories.isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : (vaultStories.data ?? []).length === 0 ? (
          <p className="postcard rounded-[16px] p-6 text-sm text-text-secondary">
            Stories saved for <em>Family</em> appear here — yours, and everyone whose vault
            you belong to.
          </p>
        ) : (
          <ol className="flex flex-col gap-3" data-stagger>
            {(vaultStories.data ?? []).map((s, i) => (
              <ScrollReveal as="li" key={s.id} variant="rise" index={i}>
                <StoryCard
                  story={s}
                  variant="compact"
                  onOpen={(story) => navigate(`/story/${story.id}`)}
                />
              </ScrollReveal>
            ))}
          </ol>
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

      {toast && <Toast message={toast} kind="info" onDismiss={() => setToast(null)} />}
    </div>
  );
}
