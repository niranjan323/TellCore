import type { ReactNode } from 'react';

interface FABProps {
  onClick: () => void;
  ariaLabel: string;
  icon: ReactNode;
  /**
   * `mobile-bottom` centers it above the bottom nav on mobile and shows a
   * floating button at the bottom-right on desktop. `corner` keeps it
   * bottom-right at all sizes.
   */
  placement?: 'mobile-bottom' | 'corner';
}

export function FAB({ onClick, ariaLabel, icon, placement = 'mobile-bottom' }: FABProps) {
  const positioning =
    placement === 'mobile-bottom'
      ? 'fixed bottom-[68px] left-1/2 -translate-x-1/2 md:bottom-8 md:left-auto md:right-8 md:translate-x-0'
      : 'fixed bottom-8 right-8';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${positioning} z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-surface shadow-lg transition-transform hover:scale-105 active:scale-95 animate-warm-glow`}
    >
      {icon}
    </button>
  );
}
