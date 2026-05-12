import { Logo } from '../ui/Logo';
import type { Story } from '../../types/contracts';

interface MemoryCardProps {
  story: Story;
  /** Optional quote to pull from the story body. Falls back to excerpt. */
  quote?: string;
}

export function MemoryCard({ story, quote }: MemoryCardProps) {
  const line = quote ?? story.excerpt;
  return (
    <div
      className="relative aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-lg border bg-gradient-to-br from-primary-light to-surface-secondary p-7 shadow-md"
      role="figure"
      aria-label={`Memory card from ${story.author.name}`}
    >
      <div className="absolute inset-0 bg-paper-grain opacity-80" aria-hidden />
      <div className="relative flex h-full flex-col justify-between">
        <div>
          <span className="decorative-quote" aria-hidden />
          <p className="-mt-3 font-display text-[22px] leading-snug text-text-primary md:text-[26px]">
            {line}
          </p>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="font-handwritten text-xl text-primary-dark">
              — {story.author.name}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-text-hint">
              {new Date(story.createdAt).toLocaleDateString(undefined, {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="opacity-75">
            <Logo size="sm" showWordmark={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
