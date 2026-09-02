import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { TextEditor } from '../components/writing/TextEditor';
import { VisibilityPicker } from '../components/writing/VisibilityPicker';
import { Toast, type ToastKind } from '../components/ui/Toast';
import { fetchStoryById, updateStory } from '../api/stories.api';
import type { StoryVisibility } from '../types/contracts';

export function EditStoryPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: story, isLoading } = useQuery({
    queryKey: ['story', storyId],
    queryFn: () => fetchStoryById(storyId!),
    enabled: !!storyId,
  });

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<StoryVisibility>('private');
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);

  // Prefill once per story load (don't clobber in-progress edits on refetch).
  useEffect(() => {
    if (story && loadedFor !== story.id) {
      setTitle(story.title);
      setText(story.body);
      setVisibility(story.visibility);
      setLoadedFor(story.id);
    }
  }, [story, loadedFor]);

  async function handleSave() {
    if (!story || !text.trim()) return;
    setSaving(true);
    try {
      await updateStory(story.id, { title, text, visibility });
      await queryClient.invalidateQueries({ queryKey: ['story', story.id] });
      await queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      setToast({ message: 'Story updated', kind: 'success' });
      setTimeout(() => navigate(`/story/${story.id}`, { replace: true }), 800);
    } catch {
      setSaving(false);
      setToast({ message: "Couldn't save changes — try again.", kind: 'error' });
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!story || !story.isMine) {
    return (
      <div className="mx-auto max-w-story p-8 text-center text-text-secondary">
        You can only edit your own stories.
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-paper-grain opacity-80" />
        <div className="absolute inset-0 bg-noise opacity-40 mix-blend-multiply" />
      </div>

      <header className="pt-safe sticky top-0 z-10 flex items-center justify-between border-b bg-surface/80 px-4 py-3 backdrop-blur md:px-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-sm font-medium text-text-secondary backdrop-blur transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <p className="hidden font-handwritten text-base text-text-secondary md:block">
          Editing a page of your story
        </p>
        <span className="w-16" aria-hidden />
      </header>

      <main className="animate-page relative px-4 py-10 md:px-10 md:py-14">
        <div className="mx-auto mb-6 max-w-story">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 120))}
            placeholder="Title"
            aria-label="Story title"
            className="w-full border-none bg-transparent font-display text-3xl font-semibold text-text-primary outline-none placeholder:text-text-hint"
          />
        </div>
        <TextEditor value={text} onChange={setText} />
      </main>

      <footer className="sticky bottom-0 border-t bg-surface/85 px-4 py-3 backdrop-blur md:px-10 md:py-4">
        <div className="mx-auto flex max-w-story flex-wrap items-center justify-between gap-3">
          <VisibilityPicker value={visibility} onChange={setVisibility} />
          <div className="flex items-center gap-3">
            {visibility !== 'private' && (
              <span className="hidden text-xs text-text-hint md:block">
                Shared stories go through review again
              </span>
            )}
            <Button
              label="Save changes"
              variant="primary"
              disabled={!text.trim()}
              loading={saving}
              onClick={handleSave}
            />
          </div>
        </div>
      </footer>

      {toast && <Toast message={toast.message} kind={toast.kind} onDismiss={() => setToast(null)} />}
    </div>
  );
}
