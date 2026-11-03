import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { authedHttp, useSession } from '@/features/auth';
import { HttpError } from '@/lib/http';

import { notificationPageSchema } from './types';

export const NOTIFICATIONS_POLL_MS = 60_000;

const notificationsKey = ['notifications'] as const;

/**
 * The signed-in user's notifications, newest first. Polled while the tab is
 * visible. The key carries the account email so a previous account's cache is
 * never shown to the next one on the same browser.
 */
export function useNotifications() {
  const { status, email } = useSession();

  return useInfiniteQuery({
    queryKey: [...notificationsKey, email],
    queryFn: async ({ pageParam }) => {
      const query = pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : '';
      return notificationPageSchema.parse(await authedHttp<unknown>(`/api/notifications${query}`));
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
    enabled: status === 'signedIn',
    refetchInterval: NOTIFICATIONS_POLL_MS,
  });
}

/**
 * `onError` is a hook option, not a `mutate()` option: the popover closes (and
 * unmounts the caller) right after the click, and `mutate()` callbacks do not
 * fire after unmount.
 */
export function useMarkNotificationRead({ onError }: { onError?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    onError,
    mutationFn: async (id: string) => {
      try {
        await authedHttp<null>(`/api/notifications/${encodeURIComponent(id)}/read`, {
          method: 'POST',
        });
      } catch (error) {
        // Already gone is the outcome the user asked for.
        if (!(error instanceof HttpError && error.status === 404)) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authedHttp<null>('/api/notifications/read-all', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey }),
  });
}
