import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';
import type { Story } from '../../types/contracts';
import { AudioStoryPlayer } from './AudioStoryPlayer';

interface StoryReaderProps {
  story: Story;
}

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function StoryReader({ story }: StoryReaderProps) {
  return (
    <article className="mx-auto max-w-story animate-ink-fade">
      <header className="mb-8">
        <h1 className="font-display text-[34px] font-semibold leading-tight tracking-tight text-text-primary md:text-[44px]">
          {story.title}
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <Avatar author={story.author} size="md" />
          <div>
            <div className="text-sm font-medium text-text-primary">{story.author.name}</div>
            <div className="font-handwritten text-base text-text-secondary">
              {formatLongDate(story.createdAt)}
            </div>
          </div>
        </div>
      </header>

      {story.kind === 'voice' ? (
        <div className="mb-8">
          <AudioStoryPlayer
            audioUrl={story.audioUrl}
            durationSeconds={story.durationSeconds}
            placeholder={!story.audioUrl}
          />
        </div>
      ) : null}

      <div className="story-prose">
        {story.body.split(/\n\n+/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {story.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t pt-5">
          {story.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}
    </article>
  );
}
