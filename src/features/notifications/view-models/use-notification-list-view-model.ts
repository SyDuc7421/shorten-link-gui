'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useMarkAllNotificationsRead, useNotifications } from '../model/notifications-api';
import type { Notification } from '../model/types';

export type NotificationListState =
  | { status: 'pending' }
  | { status: 'error'; retry: () => void }
  | { status: 'empty' }
  | {
      status: 'success';
      items: Notification[];
      hasNextPage: boolean;
      isFetchingNextPage: boolean;
      /** A background poll, not a next page — the view dims the old rows. */
      isRefreshing: boolean;
      loadMore: () => void;
    };

export function useNotificationListViewModel() {
  const t = useTranslations('notifications');
  const { data, status, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching } =
    useNotifications();
  const markAll = useMarkAllNotificationsRead();

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  let state: NotificationListState;
  if (!data) {
    // Only a failed first load replaces the list; a failed poll keeps it.
    state =
      status === 'error' ? { status: 'error', retry: () => void refetch() } : { status: 'pending' };
  } else if (items.length === 0) {
    state = { status: 'empty' };
  } else {
    state = {
      status: 'success',
      items,
      hasNextPage,
      isFetchingNextPage,
      isRefreshing: isRefetching && !isFetchingNextPage,
      loadMore: () => void fetchNextPage(),
    };
  }

  return {
    state,
    unreadCount: data?.pages[0]?.unread_count ?? 0,
    isMarkingAll: markAll.isPending,
    markAllRead: () => markAll.mutate(undefined, { onError: () => toast.error(t('markFailed')) }),
  };
}
