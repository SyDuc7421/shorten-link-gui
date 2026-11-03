'use client';

import { Ban, BellOff, CircleCheck, Clock, KeyRound, Loader2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import type { Notification } from '../model/types';
import { useNotificationItemViewModel } from '../view-models/use-notification-item-view-model';
import { useNotificationListViewModel } from '../view-models/use-notification-list-view-model';

const SKELETON_ROWS = ['a', 'b', 'c'];

const ROW_CLASSES =
  'flex min-h-11 w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-(--duration-fast) hover:bg-accent';

interface NotificationListProps {
  /** Runs after a notification is selected; the popover uses it to close. */
  onDone: () => void;
}

export function NotificationList({ onDone }: NotificationListProps) {
  const t = useTranslations('notifications');
  const { state, unreadCount, isMarkingAll, markAllRead } = useNotificationListViewModel();

  if (state.status === 'pending') return <NotificationListSkeleton />;

  if (state.status === 'error') {
    return (
      <ErrorState
        title={t('loadErrorTitle')}
        description={t('loadErrorDescription')}
        onRetry={state.retry}
        className="border-0 py-8"
      />
    );
  }

  if (state.status === 'empty') {
    return (
      <EmptyState
        icon={<BellOff className="size-5" aria-hidden="true" />}
        title={t('emptyTitle')}
        description={t('emptyDescription')}
        className="border-0 py-8"
      />
    );
  }

  return (
    <div className="flex flex-col">
      {unreadCount > 0 ? (
        <div className="flex justify-end border-b border-border px-2 py-1">
          <Button
            type="button"
            variant="ghost"
            className="h-11 md:h-9"
            disabled={isMarkingAll}
            onClick={markAllRead}
          >
            {t('markAllRead')}
          </Button>
        </div>
      ) : null}
      <ul
        className={cn(
          'flex flex-col divide-y divide-border transition-opacity duration-(--duration-base)',
          state.isRefreshing && 'opacity-60',
        )}
      >
        {state.items.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} onDone={onDone} />
        ))}
      </ul>
      {state.hasNextPage ? (
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-none border-t border-border md:h-9"
          disabled={state.isFetchingNextPage}
          onClick={state.loadMore}
        >
          {state.isFetchingNextPage ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          {t('loadMore')}
        </Button>
      ) : null}
    </div>
  );
}

function NotificationItem({
  notification,
  onDone,
}: {
  notification: Notification;
  onDone: () => void;
}) {
  const t = useTranslations('notifications');
  const format = useFormatter();
  const { isUnread, onSelect } = useNotificationItemViewModel(notification, onDone);

  const code = notification.code ?? '';
  let text: string;
  let icon: React.ReactNode;
  switch (notification.type) {
    case 'link_disabled':
      text = t('linkDisabled', { code });
      icon = <Ban className="size-5" aria-hidden="true" />;
      break;
    case 'link_enabled':
      text = t('linkEnabled', { code });
      icon = <CircleCheck className="size-5" aria-hidden="true" />;
      break;
    case 'link_expiring':
      text = t('linkExpiring', {
        code,
        date: notification.expires_at
          ? format.dateTime(new Date(notification.expires_at), {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : '',
      });
      icon = <Clock className="size-5" aria-hidden="true" />;
      break;
    case 'password_changed':
      text = t('passwordChanged');
      icon = <KeyRound className="size-5" aria-hidden="true" />;
      break;
  }

  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-primary/10">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cn('text-sm wrap-break-word', isUnread && 'font-medium')}>{text}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {format.relativeTime(new Date(notification.created_at))}
        </span>
      </span>
      {isUnread ? (
        <>
          <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span className="sr-only">{t('unread')}</span>
        </>
      ) : null}
    </>
  );

  return (
    <li>
      {notification.type === 'password_changed' ? (
        <button type="button" className={ROW_CLASSES} onClick={onSelect}>
          {content}
        </button>
      ) : (
        <Link href="/" className={ROW_CLASSES} onClick={onSelect}>
          {content}
        </Link>
      )}
    </li>
  );
}

function NotificationListSkeleton() {
  return (
    <div className="flex flex-col divide-y divide-border">
      {SKELETON_ROWS.map((key) => (
        <div key={key} className="flex items-start gap-3 px-4 py-3">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
