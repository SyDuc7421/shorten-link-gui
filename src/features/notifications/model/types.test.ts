import { describe, expect, it } from 'vitest';

import { notificationPageSchema } from './types';

const passwordChanged = {
  id: '12',
  type: 'password_changed',
  link_id: null,
  code: null,
  expires_at: null,
  read_at: null,
  created_at: '2026-11-03T00:00:00Z',
};

describe('notificationPageSchema', () => {
  it('accepts password_changed with null link_id and code', () => {
    const page = notificationPageSchema.parse({
      items: [passwordChanged],
      next_cursor: '',
      unread_count: 1,
    });
    expect(page.items[0]?.link_id).toBeNull();
    expect(page.items[0]?.code).toBeNull();
  });

  it('accepts a link_expiring item with its link and expiry', () => {
    const page = notificationPageSchema.parse({
      items: [
        {
          ...passwordChanged,
          type: 'link_expiring',
          link_id: '734000000000000001',
          code: 'abc',
          expires_at: '2026-11-04T00:00:00Z',
        },
      ],
      next_cursor: '12',
      unread_count: 1,
    });
    expect(page.items[0]?.code).toBe('abc');
  });

  it('rejects an unknown type', () => {
    expect(() =>
      notificationPageSchema.parse({
        items: [{ ...passwordChanged, type: 'nope' }],
        unread_count: 0,
      }),
    ).toThrow();
  });

  it('rejects a page without unread_count', () => {
    expect(() => notificationPageSchema.parse({ items: [], next_cursor: '' })).toThrow();
  });
});
