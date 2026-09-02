import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bookmark, Flag, Heart, ImageDown, Languages, Lock, MoreHorizontal, PenLine, Share2, Sparkles, Square, Trash2, Volume2 } from 'lucide-react';
import { ReportStoryModal } from '../components/stories/ReportStoryModal';
import { ShareCardModal } from '../components/stories/ShareCardModal';
import { StoryReader } from '../components/stories/StoryReader';
import { Button } from '../components/ui/Button';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { Spinner } from '../components/ui/Spinner';
import { Toast } from '../components/ui/Toast';
import {
  deleteStory,
  fetchStoryById,
  fetchStoryTranslation,
  recordStoryView,
  toggleStoryFavourite,
  toggleStoryHeart,
} from '../api/stories.api';
import { useSpeech } from '../hooks/useSpeech';
import type { StoryTranslation } from '../types/contracts';

const READ_LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'mr', label: 'मराठी' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' },
];

export function StoryDetailPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [heart, setHeart] = useState<{ count: number; hearted: boolean } | null>(null);
  const [fav, setFav] = useState<boolean | null>(null);
  const [translation, setTranslation] = useState<StoryTranslation | null>(null);
  const [translating, setTranslating] = useState(false);
  const { supported: speechSupported, speaking, speak, stop: stopSpeaking } = useSpeech();

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

  async function handleFavourite() {
    if (!story) return;
    try {
      const result = await toggleStoryFavourite(story.id);
      setFav(result.hasFavourited);
      await queryClient.invalidateQueries({ queryKey: ['favourite-stories'] });
      setToast(result.hasFavourited ? 'Saved — find it under My Stories → Saved' : 'Removed from saved');
    } catch {
      setToast("Couldn't do that right now");
    }
  }

  async function handleLanguageChange(code: string) {
    if (!story) return;
    stopSpeaking();
    if (!code || code === (story.originalLanguage ?? 'original')) {
      setTranslation(null);
      return;
    }
    setTranslating(true);
    try {
      setTranslation(await fetchStoryTranslation(story.id, code));
    } catch {
      setToast("Translation isn't available right now — try again in a moment.");
    } finally {
      setTranslating(false);
    }
  }

  function handleListen() {
    if (!story) return;
    if (speaking) {
      stopSpeaking();
      return;
    }
    const text = `${translation?.title ?? story.title}. ${translation?.body ?? story.body}`;
    speak(text, translation?.languageCode ?? story.originalLanguage);
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
              {story.isMine && (
                <MenuButton
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/story/${story.id}/edit`);
                  }}
                  icon={<PenLine className="h-4 w-4" aria-hidden />}
                  label="Edit story"
                />
              )}
              {!story.isMine && (
                <MenuButton
                  onClick={() => {
                    setMenuOpen(false);
                    setReportOpen(true);
                  }}
                  icon={<Flag className="h-4 w-4" aria-hidden />}
                  label="Report story"
                />
              )}
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

      {story.summary && !story.isPreview && !translation && (
        <div className="mx-auto mb-8 max-w-story rounded-md border-l-4 border-accent bg-surface-secondary/70 px-5 py-4">
          <p className="font-handwritten text-lg text-primary-dark">In short</p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">{story.summary}</p>
        </div>
      )}

      {/* Read in another language */}
      <div className="mx-auto mb-6 flex max-w-story flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary">
          <Languages className="h-4 w-4 text-primary" aria-hidden />
          <span className="sr-only">Read this story in</span>
          <select
            value={translation?.languageCode ?? story.originalLanguage ?? 'original'}
            onChange={(e) => void handleLanguageChange(e.target.value)}
            className="bg-transparent text-sm text-text-primary outline-none"
            aria-label="Read this story in another language"
          >
            <option value={story.originalLanguage ?? 'original'}>
              Original{story.originalLanguage ? ` (${story.originalLanguage})` : ''}
            </option>
            {READ_LANGUAGES.filter((l) => l.code !== (story.originalLanguage ?? 'en')).map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        {translating && <Spinner size="sm" />}
        {translation && (
          <span className="text-xs text-text-hint">
            Translated by AI ·{' '}
            <button
              type="button"
              onClick={() => void handleLanguageChange(story.originalLanguage ?? 'original')}
              className="underline underline-offset-2 hover:text-text-primary"
            >
              Show original
            </button>
          </span>
        )}
      </div>

      <StoryReader
        story={
          translation
            ? { ...story, title: translation.title ?? story.title, body: translation.body }
            : story
        }
      />

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
        {speechSupported && (
          <Button
            label={speaking ? 'Stop listening' : 'Listen to this story'}
            variant={speaking ? 'secondary' : 'primary'}
            leadingIcon={
              speaking
                ? <Square className="h-4 w-4 fill-current" aria-hidden />
                : <Volume2 className="h-4 w-4" aria-hidden />
            }
            onClick={handleListen}
            fullWidth
          />
        )}
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
        <Button
          label={(fav ?? story.hasFavourited) ? 'Saved to favourites' : 'Save to favourites'}
          variant="secondary"
          leadingIcon={
            <Bookmark
              className={`h-4 w-4 ${(fav ?? story.hasFavourited) ? 'fill-current text-primary' : ''}`}
              aria-hidden
            />
          }
          onClick={handleFavourite}
          fullWidth
        />
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
        {story.isMine && (
          <Button
            label="Edit story"
            variant="ghost"
            leadingIcon={<PenLine className="h-4 w-4" aria-hidden />}
            onClick={() => navigate(`/story/${story.id}/edit`)}
            fullWidth
          />
        )}
      </div>

      <ShareCardModal
        story={story}
        open={shareCardOpen}
        onClose={() => setShareCardOpen(false)}
        onToast={setToast}
      />

      <ReportStoryModal
        storyId={story.id}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
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
