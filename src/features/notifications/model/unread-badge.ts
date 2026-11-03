export const BADGE_MAX = 99;

export interface UnreadBadge {
  value: number;
  hasOverflow: boolean;
}

/** What the bell's badge shows for `count` unread notifications; `null` hides it. */
export function getUnreadBadge(count: number): UnreadBadge | null {
  if (!Number.isFinite(count) || count <= 0) return null;
  return { value: Math.min(count, BADGE_MAX), hasOverflow: count > BADGE_MAX };
}
