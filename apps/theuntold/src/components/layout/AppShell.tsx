import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '../../hooks/useNavigation';
import { fetchNotifications } from '../../api/stories.api';
import { TopBar } from './TopBar';
import { DesktopSideNav, MobileBottomNav } from './NavBar';

interface AppShellProps {
  children: ReactNode;
  fullBleed?: boolean;
}

export function AppShell({ children, fullBleed = false }: AppShellProps) {
  const nav = useNavigation();
  const items = nav.data?.items ?? [];
  const notifs = useQuery({
    queryKey: ['notifications', 'theuntold'],
    queryFn: fetchNotifications,
  });
  const unread = (notifs.data ?? []).filter((n) => !n.read).length;

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <TopBar navItems={items} unreadCount={unread} />

      <div className="mx-auto flex w-full max-w-page flex-1 md:gap-6 md:px-8">
        <aside className="hidden md:block md:w-52 md:shrink-0 md:py-6">
          <DesktopSideNav items={items} />
        </aside>

        <main
          className={
            fullBleed
              ? 'flex-1 pb-28 md:pb-12'
              : 'flex-1 px-4 pb-28 pt-4 md:px-0 md:pb-12 md:pt-6'
          }
        >
          {children}
        </main>
      </div>

      <MobileBottomNav items={items} />
    </div>
  );
}
