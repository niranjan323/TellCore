import type { ReactNode } from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { Logo } from '../ui/Logo';
import { NavBar } from './NavBar';

interface AppShellProps {
  children: ReactNode;
  fullBleed?: boolean;
}

export function AppShell({ children, fullBleed = false }: AppShellProps) {
  const navQuery = useNavigation();
  const items = navQuery.data?.items ?? [];

  return (
    <div className="flex min-h-dvh flex-col bg-surface-secondary">
      <header className="sticky top-0 z-30 border-b bg-surface/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-page items-center justify-between px-4 py-3 md:px-6">
          <Logo size="sm" />
          <NavBar items={items} />
        </div>
      </header>

      <main
        className={
          fullBleed
            ? 'flex-1 pb-24 md:pb-10'
            : 'mx-auto w-full max-w-page flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-10 md:pt-10'
        }
      >
        {children}
      </main>
    </div>
  );
}
