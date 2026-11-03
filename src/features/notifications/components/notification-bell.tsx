'use client';

import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { useNotificationBellViewModel } from '../view-models/use-notification-bell-view-model';
import { NotificationList } from './notification-list';

/** Header bell: unread badge and a popover list. Renders nothing when signed out. */
export function NotificationBell() {
  const t = useTranslations('notifications');
  const state = useNotificationBellViewModel();

  if (state.status === 'hidden') return null;
  const { badge, unreadCount, isOpen, onOpenChange, close } = state;

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="relative h-11 min-w-11 md:h-9 md:min-w-9"
          aria-label={t('bellLabel', { count: unreadCount })}
        >
          <Bell aria-hidden="true" />
          {badge ? (
            <Badge
              aria-hidden="true"
              className="absolute top-0 right-0 h-5 min-w-5 px-1 tabular-nums"
            >
              {badge.hasOverflow ? t('badgeOverflow', { count: badge.value }) : badge.value}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 sm:w-96" aria-label={t('title')}>
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">{t('title')}</h2>
        <div className="max-h-96 overflow-y-auto">
          <NotificationList onDone={close} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
