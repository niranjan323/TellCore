import type { ElementType, HTMLAttributes, ReactNode } from 'react';

interface ScrollRevealProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: 'rise' | 'left' | 'scale';
  children: ReactNode;
  delay?: number;
  index?: number;
}

const VARIANTS = { rise: 'reveal', left: 'reveal-left', scale: 'reveal-scale' };

/**
 * 2026 scroll-driven reveal. Uses CSS `animation-timeline: view()` where
 * supported; falls back to a one-shot mount animation otherwise.
 */
export function ScrollReveal({
  as,
  variant = 'rise',
  children,
  className,
  delay,
  index,
  style,
  ...rest
}: ScrollRevealProps) {
  const Tag = (as ?? 'div') as ElementType;
  const cls = `${VARIANTS[variant]} ${className ?? ''}`.trim();
  const mergedStyle = {
    ...(style ?? {}),
    animationDelay: delay !== undefined ? `${delay}s` : undefined,
    ['--i' as string]: index !== undefined ? String(index) : undefined,
  };
  return (
    <Tag className={cls} style={mergedStyle} {...rest}>
      {children}
    </Tag>
  );
}
