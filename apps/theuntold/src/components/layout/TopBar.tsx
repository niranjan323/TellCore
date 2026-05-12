import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Logo } from '../ui/Logo';
import type { NavigationItemResponse } from '../../types/contracts';

interface TopBarProps {
  navItems: NavigationItemResponse[];
  unreadCount?: number;
}

export function TopBar({ navItems, unreadCount = 0 }: TopBarProps) {
  const hasNotifications = navItems.some((i) => i.key === 'notifs');
  return (
    <header className="sticky top-0 z-30 border-b bg-surface/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-page items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" className="inline-flex">
          <Logo size="md" />
        </Link>
        {hasNotifications && (
          <Link
            to="/notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:bg-surface-secondary"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" aria-hidden />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-primary-dark">
                {unreadCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
