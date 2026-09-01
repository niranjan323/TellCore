import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Home,
  Library,
  PenLine,
  Shield,
  Sparkles,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { NavigationItemResponse } from '../../types/contracts';
import { FAB } from '../ui/FAB';

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  'book-open': BookOpen,
  'book-marked': BookOpen,
  'pen-line': PenLine,
  library: Library,
  sparkles: Sparkles,
  user: User,
  bell: Bell,
  shield: Shield,
};

function iconFor(key: string | null | undefined): LucideIcon {
  if (!key) return BookOpen;
  return ICONS[key.toLowerCase()] ?? BookOpen;
}

interface NavProps {
  items: NavigationItemResponse[];
}

export function DesktopSideNav({ items }: NavProps) {
  if (!items.length) return null;
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = iconFor(item.icon);
        return (
          <NavLink
            key={item.key}
            to={item.route}
            end={item.route === '/'}
            className={({ isActive }) =>
              `inline-flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-light text-primary-dark'
                  : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
              }`
            }
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function MobileBottomNav({ items }: NavProps) {
  const navigate = useNavigate();
  if (!items.length) return null;

  const fabItem = items.find((i) => i.key === 'today') ?? null;
  const tabItems = items.filter(
    (i) => i.key !== 'today' && i.key !== 'notifs' && i.key !== 'vault',
  );
  const half = Math.ceil(tabItems.length / 2);
  const leftItems = tabItems.slice(0, half);
  const rightItems = tabItems.slice(half);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul
          className="grid items-stretch"
          style={{ gridTemplateColumns: `repeat(${tabItems.length + 1}, minmax(0, 1fr))` }}
        >
          {leftItems.map((item) => (
            <MobileTab key={item.key} item={item} />
          ))}
          <li className="relative flex items-center justify-center" aria-hidden />
          {rightItems.map((item) => (
            <MobileTab key={item.key} item={item} />
          ))}
        </ul>
      </nav>

      {fabItem && (
        <div className="md:hidden">
          <FAB
            onClick={() => navigate(fabItem.route)}
            ariaLabel={fabItem.label}
            icon={<PenLine className="h-7 w-7" aria-hidden />}
          />
        </div>
      )}
    </>
  );
}

function MobileTab({ item }: { item: NavigationItemResponse }) {
  const Icon = iconFor(item.icon);
  return (
    <li>
      <NavLink
        to={item.route}
        end={item.route === '/'}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium ${
            isActive ? 'text-primary-dark' : 'text-text-secondary'
          }`
        }
      >
        <Icon className="h-5 w-5" aria-hidden />
        <span>{item.label}</span>
      </NavLink>
    </li>
  );
}
