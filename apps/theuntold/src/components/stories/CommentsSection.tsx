import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Spinner } from '../ui/Spinner';
import { addStoryComment, deleteStoryComment, fetchStoryComments } from '../../api/stories.api';

function relativeDate(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface CommentsSectionProps {
  storyId: string;
  onToast: (message: string) => void;
}

export function CommentsSection({ storyId, onToast }: CommentsSectionProps) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  const { data: comments, isLoading } = useQuery({
    queryKey: ['story-comments', storyId],
    queryFn: () => fetchStoryComments(storyId),
  });

  async function handlePost() {
    const body = draft.trim();
    if (!body) return;
    setPosting(true);
    try {
      await addStoryComment(storyId, body);
      setDraft('');
      await queryClient.invalidateQueries({ queryKey: ['story-comments', storyId] });
    } catch {
      onToast("Couldn't post your note right now — try again.");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await deleteStoryComment(storyId, commentId);
      await queryClient.invalidateQueries({ queryKey: ['story-comments', storyId] });
      onToast('Comment removed');
    } catch {
      onToast("Couldn't remove that comment right now.");
    }
  }

  return (
    <section className="mx-auto mt-12 max-w-story">
      <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold text-text-primary">
        <MessageCircle className="h-4 w-4 text-primary" aria-hidden />
        Notes from readers
        {comments && comments.length > 0 && (
          <span className="text-sm font-normal text-text-hint">· {comments.length}</span>
        )}
      </h2>

      <div className="mt-4 flex items-start gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 1000))}
          placeholder="Leave a kind note for the storyteller…"
          rows={2}
          className="min-w-0 flex-1 resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-text-hint focus:border-primary"
        />
        <button
          type="button"
          onClick={handlePost}
          disabled={posting || !draft.trim()}
          aria-label="Post comment"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-surface transition-colors hover:bg-primary-dark disabled:opacity-40"
        >
          {posting ? <Spinner size="sm" /> : <Send className="h-4 w-4" aria-hidden />}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : (comments ?? []).length === 0 ? (
        <p className="mt-4 font-handwritten text-lg text-text-hint">
          No notes yet — be the first to write back.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {(comments ?? []).map((comment) => (
            <li key={comment.id} className="flex items-start gap-3 rounded-md border bg-surface p-3.5">
              <Avatar author={comment.author} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {comment.author.name}
                  </span>
                  <span className="shrink-0 font-handwritten text-sm text-text-hint">
                    {relativeDate(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                  {comment.body}
                </p>
              </div>
              {comment.canDelete && (
                <button
                  type="button"
                  onClick={() => void handleDelete(comment.id)}
                  aria-label="Delete comment"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-hint transition-colors hover:bg-primary-light hover:text-primary-dark"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
