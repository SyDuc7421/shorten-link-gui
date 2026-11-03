'use client';

import { useState } from 'react';

import { useSession } from '@/features/auth';

import { useNotifications } from '../model/notifications-api';
import { getUnreadBadge, type UnreadBadge } from '../model/unread-badge';

export type NotificationBellState =
  | { status: 'hidden' }
  | {
      status: 'visible';
      unreadCount: number;
      badge: UnreadBadge | null;
      isOpen: boolean;
      onOpenChange: (open: boolean) => void;
      close: () => void;
    };

export function useNotificationBellViewModel(): NotificationBellState {
  const { status } = useSession();
  const { data } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  if (status !== 'signedIn') return { status: 'hidden' };

  // `unread_count` covers every notification; read it from the newest page.
  const unreadCount = data?.pages[0]?.unread_count ?? 0;

  return {
    status: 'visible',
    unreadCount,
    badge: getUnreadBadge(unreadCount),
    isOpen,
    onOpenChange: setIsOpen,
    close: () => setIsOpen(false),
  };
}
