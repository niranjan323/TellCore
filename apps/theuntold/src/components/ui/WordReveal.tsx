import type { ComponentProps, ElementType } from 'react';

interface WordRevealProps<T extends ElementType = 'span'> {
  text: string;
  as?: T;
  stagger?: number;
  delay?: number;
  className?: string;
}

export function WordReveal<T extends ElementType = 'span'>({
  text,
  as,
  stagger = 0.09,
  delay = 0,
  className,
  ...rest
}: WordRevealProps<T> & Omit<ComponentProps<T>, 'className' | 'children'>) {
  const Tag = (as ?? 'span') as ElementType;
  const words = text.split(' ');
  return (
    <Tag className={className} {...rest}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-baseline">
          <span
            className="inline-block animate-word-rise will-change-transform"
            style={{ animationDelay: `${delay + i * stagger}s` }}
          >
            {word}
          </span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
