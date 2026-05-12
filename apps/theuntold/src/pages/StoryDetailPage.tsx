import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MoreHorizontal, Share2, Sparkles, Trash2 } from 'lucide-react';
import { StoryReader } from '../components/stories/StoryReader';
import { Button } from '../components/ui/Button';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { Spinner } from '../components/ui/Spinner';
import { Toast } from '../components/ui/Toast';
import { fetchStoryById } from '../api/stories.api';

export function StoryDetailPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: story, isLoading } = useQuery({
    queryKey: ['story', storyId],
    queryFn: () => fetchStoryById(storyId!),
    enabled: !!storyId,
  });

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
              <MenuButton
                onClick={() => {
                  setMenuOpen(false);
                  setToast('Submitted for feature consideration');
                }}
                icon={<Sparkles className="h-4 w-4" aria-hidden />}
                label="Submit for feature"
              />
              <MenuButton
                destructive
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmDelete(true);
                }}
                icon={<Trash2 className="h-4 w-4" aria-hidden />}
                label="Delete"
              />
            </div>
          )}
        </div>
      </header>

      <StoryReader story={story} />

      <div className="mx-auto mt-10 flex max-w-story flex-col gap-2">
        <Button
          label="Share this story"
          variant="secondary"
          leadingIcon={<Share2 className="h-4 w-4" aria-hidden />}
          onClick={handleShare}
          fullWidth
        />
      </div>

      <ConfirmationModal
        open={confirmDelete}
        title="Delete this story?"
        description="You can&apos;t undo this. Make sure you have a copy if you want to keep it."
        confirmLabel="Delete forever"
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          setToast('Story deleted');
          setTimeout(() => navigate('/stories', { replace: true }), 800);
        }}
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
