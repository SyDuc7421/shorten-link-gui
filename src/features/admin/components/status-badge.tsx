'use client';

import { Ban, CircleCheck, Clock, UserX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';

import type { AdminLinkStatus } from '../model/link-status';

// Status is icon + text, never colour alone (DESIGN.md §6 Badge). Disabled is a
// deliberate state, not an error, so it is outline, not destructive.
const LINK_STATUS_ICONS = {
  active: CircleCheck,
  disabled: Ban,
  ownerDisabled: UserX,
  expired: Clock,
} as const;

export function LinkStatusBadge({ status }: { status: AdminLinkStatus }) {
  const t = useTranslations('admin.status');
  const Icon = LINK_STATUS_ICONS[status];

  return (
    <Badge variant={status === 'active' ? 'secondary' : 'outline'} className="gap-1">
      <Icon aria-hidden="true" />
      {t(status)}
    </Badge>
  );
}

export function UserStatusBadge({ disabledAt }: { disabledAt: string | null }) {
  const t = useTranslations('admin.status');

  return disabledAt ? (
    <Badge variant="outline" className="gap-1">
      <Ban aria-hidden="true" />
      {t('disabled')}
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1">
      <CircleCheck aria-hidden="true" />
      {t('active')}
    </Badge>
  );
}
