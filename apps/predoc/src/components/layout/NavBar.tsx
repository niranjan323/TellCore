import { NavLink } from 'react-router-dom';
import {
  Clock,
  Download,
  FileText,
  Home,
  HelpCircle,
  History,
  Settings,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { NavigationItemResponse } from '../../types/contracts';

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  clock: Clock,
  history: History,
  user: User,
  settings: Settings,
  export: Download,
  download: Download,
  file: FileText,
  help: HelpCircle,
};

function iconFor(key: string | null | undefined): LucideIcon {
  if (!key) return Home;
  return ICONS[key.toLowerCase()] ?? Home;
}

interface NavBarProps {
  items: NavigationItemResponse[];
}

export function NavBar({ items }: NavBarProps) {
  if (!items.length) return null;

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="flex items-stretch justify-around">
          {items.map((item) => {
            const Icon = iconFor(item.icon);
            return (
              <li key={item.key} className="flex-1">
                <NavLink
                  to={item.route}
                  end={item.route === '/'}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium ${
                      isActive ? 'text-primary' : 'text-text-secondary'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav
        aria-label="Primary"
        className="hidden md:flex md:items-center md:gap-1"
      >
        {items.map((item) => {
          const Icon = iconFor(item.icon);
          return (
            <NavLink
              key={item.key}
              to={item.route}
              end={item.route === '/'}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-light text-primary-dark'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
