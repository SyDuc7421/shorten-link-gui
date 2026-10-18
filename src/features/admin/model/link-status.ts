import type { AdminLink } from './types';

export type AdminLinkStatus = 'active' | 'disabled' | 'ownerDisabled' | 'expired';

/** Why a link does or does not redirect, most deliberate cause first. */
export function getAdminLinkStatus(
  link: Pick<AdminLink, 'disabled_at' | 'expires_at' | 'owner'>,
  now: Date,
): AdminLinkStatus {
  if (link.disabled_at) return 'disabled';
  if (link.owner.disabled_at) return 'ownerDisabled';
  if (link.expires_at && new Date(link.expires_at) <= now) return 'expired';
  return 'active';
}
