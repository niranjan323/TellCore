import { useQuery } from '@tanstack/react-query';
import { Bell, Heart, PenLine, Sparkles, Users, type LucideIcon } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import { fetchNotifications } from '../api/stories.api';
import type { AppNotification, NotificationKind } from '../types/contracts';

const ICONS: Record<NotificationKind, LucideIcon> = {
  'daily-prompt': PenLine,
  'story-featured': Sparkles,
  'story-loved': Heart,
  'family-shared': Users,
};

function relativeDate(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'theuntold'],
    queryFn: fetchNotifications,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-text-primary md:text-3xl">
          Notifications
        </h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (data ?? []).length === 0 ? (
        <p className="rounded-lg border bg-surface p-10 text-center text-text-secondary">
          <Bell className="mx-auto mb-3 h-8 w-8 text-text-hint" aria-hidden />
          You&apos;re all caught up.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {(data ?? []).map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </ul>
      )}
    </div>
  );
}

function NotificationItem({ notification }: { notification: AppNotification }) {
  const Icon = ICONS[notification.kind] ?? Bell;
  const celebratory = notification.kind === 'story-featured';
  return (
    <li
      className={`relative flex items-start gap-3 overflow-hidden rounded-md border p-4 ${
        celebratory
          ? 'border-accent bg-accent/15 animate-warm-glow'
          : notification.read
            ? 'bg-surface'
            : 'bg-primary-light/40'
      }`}
    >
      {celebratory && <div className="absolute inset-0 bg-paper-grain opacity-50" aria-hidden />}
      <span
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          celebratory ? 'bg-accent/50 text-primary-dark' : 'bg-primary-light text-primary-dark'
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="relative flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={`font-display text-base font-semibold ${
              celebratory ? 'text-primary-dark' : 'text-text-primary'
            }`}
          >
            {notification.title}
          </p>
          <span className="shrink-0 font-handwritten text-sm text-text-secondary">
            {relativeDate(notification.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          {notification.body}
        </p>
      </div>
    </li>
  );
}
