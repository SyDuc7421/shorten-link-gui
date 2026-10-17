'use client';

import { useNow } from 'next-intl';

import { toDisplayUrl } from '../model/display-url';
import { getExpiryState } from '../model/expiry';
import type { Link } from '../model/types';

export function useLinkRowViewModel(link: Link) {
  const now = useNow();
  const { expiresAt, isExpired } = getExpiryState(link.expires_at, now);

  return {
    displayUrl: toDisplayUrl(link.short_url),
    createdAt: new Date(link.created_at),
    expiresAt,
    isExpired,
  };
}
