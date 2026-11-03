'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useMarkNotificationRead } from '../model/notifications-api';
import type { Notification } from '../model/types';

/** `onDone` runs after every selection; the popover uses it to close. */
export function useNotificationItemViewModel(notification: Notification, onDone: () => void) {
  const t = useTranslations('notifications');
  const markRead = useMarkNotificationRead({ onError: () => toast.error(t('markFailed')) });
  const isUnread = notification.read_at === null;

  return {
    isUnread,
    onSelect: () => {
      if (isUnread) markRead.mutate(notification.id);
      onDone();
    },
  };
}
