import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bookmark, Share2, Sparkles } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Toast } from '../components/ui/Toast';
import { fetchFeaturedStory, fetchStoryById } from '../api/stories.api';

export function StoryOfTheDayPage() {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId?: string }>();
  const [toast, setToast] = useState<string | null>(null);

  const { data: story, isLoading } = useQuery({
    queryKey: ['featured-detail', storyId ?? 'today'],
    queryFn: () => (storyId ? fetchStoryById(storyId) : fetchFeaturedStory()),
  });

  async function handleShare() {
    if (!story) return;
    const text = `${story.title}\n\n${story.body}\n\n— ${story.author.name} on TheUntold`;
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, text });
        return;
      } catch {
        // continue
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
      <p className="p-10 text-center text-text-secondary">No featured story today.</p>
    );
  }

  return (
    <div className="relative min-h-dvh bg-surface">
      <span className="read-progress" aria-hidden />
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary-light to-surface-secondary md:h-80">
        <div className="absolute inset-0 mesh-warm opacity-80" aria-hidden />
        <div className="absolute inset-0 bg-paper-grain opacity-80" aria-hidden />
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="top-safe absolute left-4 inline-flex items-center gap-1.5 rounded-full bg-surface/85 px-3 py-1.5 text-sm font-medium text-text-primary shadow-sm backdrop-blur hover:bg-surface md:left-8"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      <article className="mx-auto -mt-24 max-w-story px-4 pb-16 md:px-0">
        <div className="rounded-lg border bg-surface p-6 shadow-sm md:p-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-dark">
            <Sparkles className="h-3 w-3" aria-hidden />
            Story of the day
          </span>

          <h1 className="mt-5 font-display text-[36px] font-semibold leading-tight tracking-tight text-text-primary md:text-[56px]">
            {story.title}
          </h1>

          <div className="mt-5 flex items-center gap-3">
            <Avatar author={story.author} size="md" />
            <div>
              <p className="text-sm font-medium text-text-primary">{story.author.name}</p>
              <p className="font-handwritten text-base text-text-secondary">
                {new Date(story.createdAt).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="story-prose mt-8">
            {story.body.split(/\n\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-10 grid gap-2 md:grid-cols-2">
            <Button
              label="Save to favourites"
              variant="secondary"
              leadingIcon={<Bookmark className="h-4 w-4" aria-hidden />}
              onClick={() => setToast('Saved to your favourites')}
              fullWidth
            />
            <Button
              label="Share story"
              variant="primary"
              leadingIcon={<Share2 className="h-4 w-4" aria-hidden />}
              onClick={handleShare}
              fullWidth
            />
          </div>
        </div>

        <div className="mt-10 rounded-lg border bg-primary-light p-6 text-center md:p-8">
          <p className="font-display text-xl text-text-primary md:text-2xl">
            Tell your own story today.
          </p>
          <p className="mt-2 font-handwritten text-lg text-primary-dark">
            Someone is waiting to read it.
          </p>
          <div className="mt-5 inline-flex">
            <Button
              label="Submit your own story"
              variant="gold"
              onClick={() => navigate('/today')}
            />
          </div>
        </div>
      </article>

      {toast && <Toast message={toast} kind="success" onDismiss={() => setToast(null)} />}
    </div>
  );
}
