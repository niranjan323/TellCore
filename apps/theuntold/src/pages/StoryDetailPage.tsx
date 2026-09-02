import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, ImageDown, Lock, MoreHorizontal, Share2, Sparkles, Trash2 } from 'lucide-react';
import { ShareCardModal } from '../components/stories/ShareCardModal';
import { StoryReader } from '../components/stories/StoryReader';
import { Button } from '../components/ui/Button';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { Spinner } from '../components/ui/Spinner';
import { Toast } from '../components/ui/Toast';
import {
  deleteStory,
  fetchStoryById,
  recordStoryView,
  toggleStoryHeart,
} from '../api/stories.api';

export function StoryDetailPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [heart, setHeart] = useState<{ count: number; hearted: boolean } | null>(null);

  const { data: story, isLoading } = useQuery({
    queryKey: ['story', storyId],
    queryFn: () => fetchStoryById(storyId!),
    enabled: !!storyId,
  });

  // Count the view once per visit (backend dedupes per user per day).
  useEffect(() => {
    if (story && !story.isMine) void recordStoryView(story.id);
  }, [story?.id, story?.isMine]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleHeart() {
    if (!story) return;
    try {
      const result = await toggleStoryHeart(story.id);
      setHeart({ count: result.heartCount, hearted: result.hasHearted });
    } catch {
      setToast("Couldn't do that right now");
    }
  }

  async function handleDelete() {
    if (!story) return;
    setConfirmDelete(false);
    try {
      await deleteStory(story.id);
      await queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      setToast('Story deleted');
      setTimeout(() => navigate('/stories', { replace: true }), 800);
    } catch {
      setToast("Couldn't delete right now — try again");
    }
  }

  async function handleShare() {
    if (!story) return;
    const text = `${story.title}\n\n${story.body}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, text });
        return;
      } catch {
        // fall through
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setToast('Copied to clipboard');
    } catch {
      setToast("Couldn't share on this device");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!story) {
    return (
      <div className="mx-auto max-w-story p-8 text-center text-text-secondary">
        This story is no longer here.
      </div>
    );
  }

  return (
    <div className="relative">
      <span className="read-progress" aria-hidden />
      <header className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Story actions"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:bg-surface-secondary"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 z-20 mt-2 w-56 rounded-md border bg-surface p-1 shadow-md"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <MenuButton onClick={handleShare} icon={<Share2 className="h-4 w-4" aria-hidden />} label="Share" />
              {story.isMine && story.visibility !== 'community' && (
                <MenuButton
                  onClick={() => {
                    setMenuOpen(false);
                    setToast('Change visibility to "Everyone" when saving to share with the community');
                  }}
                  icon={<Sparkles className="h-4 w-4" aria-hidden />}
                  label="Submit for feature"
                />
              )}
              {story.isMine && (
                <MenuButton
                  destructive
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmDelete(true);
                  }}
                  icon={<Trash2 className="h-4 w-4" aria-hidden />}
                  label="Delete"
                />
              )}
            </div>
          )}
        </div>
      </header>

      {story.isMine && story.status === 'flagged' && story.moderationReason && (
        <div className="mx-auto mb-6 max-w-story rounded-md border border-accent bg-accent/15 p-4 text-sm text-primary-dark">
          <p className="font-semibold">This story isn&apos;t shared yet.</p>
          <p className="mt-1">{story.moderationReason}</p>
        </div>
      )}
      {story.isMine && (story.status === 'processing' || story.status === 'draft') && (
        <div className="mx-auto mb-6 max-w-story rounded-md border bg-surface-secondary p-4 text-sm text-text-secondary">
          We&apos;re still preparing this story — the polished version appears here shortly.
        </div>
      )}

      {story.summary && !story.isPreview && (
        <div className="mx-auto mb-8 max-w-story rounded-md border-l-4 border-accent bg-surface-secondary/70 px-5 py-4">
          <p className="font-handwritten text-lg text-primary-dark">In short</p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">{story.summary}</p>
        </div>
      )}

      <StoryReader story={story} />

      {story.isPreview && (
        <div className="editorial-card mx-auto mt-8 max-w-story rounded-lg border p-6 text-center">
          <Lock className="mx-auto mb-3 h-6 w-6 text-primary" aria-hidden />
          <p className="font-display text-lg text-text-primary">
            The rest of this story is waiting.
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Premium members read every community story in full, with audio.
          </p>
          <Link
            to="/upgrade"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-primary-dark"
          >
            Unlock with Premium
          </Link>
        </div>
      )}

      <div className="mx-auto mt-10 flex max-w-story flex-col gap-2">
        {!story.isMine && (
          <Button
            label={
              (heart?.hearted ?? story.hasHearted)
                ? `Held close by ${heart?.count ?? story.heartCount}`
                : `Hold this story close · ${heart?.count ?? story.heartCount}`
            }
            variant="secondary"
            leadingIcon={
              <Heart
                className={`h-4 w-4 ${(heart?.hearted ?? story.hasHearted) ? 'fill-current text-primary' : ''}`}
                aria-hidden
              />
            }
            onClick={handleHeart}
            fullWidth
          />
        )}
        {!story.isPreview && (
          <Button
            label="Share as a card"
            variant="primary"
            leadingIcon={<ImageDown className="h-4 w-4" aria-hidden />}
            onClick={() => setShareCardOpen(true)}
            fullWidth
          />
        )}
        <Button
          label="Share as text"
          variant="secondary"
          leadingIcon={<Share2 className="h-4 w-4" aria-hidden />}
          onClick={handleShare}
          fullWidth
        />
      </div>

      <ShareCardModal
        story={story}
        open={shareCardOpen}
        onClose={() => setShareCardOpen(false)}
        onToast={setToast}
      />

      <ConfirmationModal
        open={confirmDelete}
        title="Delete this story?"
        description="You can&apos;t undo this. Make sure you have a copy if you want to keep it."
        confirmLabel="Delete forever"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {toast && <Toast message={toast} kind="success" onDismiss={() => setToast(null)} />}
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-surface-secondary ${
        destructive ? 'text-primary-dark' : 'text-text-primary'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
