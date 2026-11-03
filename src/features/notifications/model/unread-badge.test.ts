import { describe, expect, it } from 'vitest';

import { getUnreadBadge } from './unread-badge';

describe('getUnreadBadge', () => {
  it.each([0, -1, Number.NaN])('has no badge for %s', (count) => {
    expect(getUnreadBadge(count)).toBeNull();
  });

  it('shows the exact count up to 99', () => {
    expect(getUnreadBadge(3)).toEqual({ value: 3, hasOverflow: false });
    expect(getUnreadBadge(99)).toEqual({ value: 99, hasOverflow: false });
  });

  it('caps above 99 and flags the overflow', () => {
    expect(getUnreadBadge(100)).toEqual({ value: 99, hasOverflow: true });
    expect(getUnreadBadge(1234)).toEqual({ value: 99, hasOverflow: true });
  });
});
