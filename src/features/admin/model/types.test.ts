import { describe, expect, it } from 'vitest';

import {
  adminLinkSchema,
  adminUserSchema,
  auditEntrySchema,
  auditFiltersSchema,
  isReasonWithinMax,
  linkFiltersSchema,
  statsFiltersSchema,
  userFiltersSchema,
} from './types';

const user = {
  id: '7311234567890123457',
  email: 'owner@example.com',
  role: 'user',
  quota_daily: 50,
  disabled_at: null,
  created_at: '2026-09-01T00:00:00Z',
  link_count: 3,
};

describe('admin schemas', () => {
  it('keeps snowflake IDs as exact strings', () => {
    expect(adminUserSchema.parse(user).id).toBe('7311234567890123457');
  });

  it('rejects a numeric ID, which JavaScript would already have rounded', () => {
    expect(adminUserSchema.safeParse({ ...user, id: 7311234567890123457 }).success).toBe(false);
  });

  it('accepts null and set disabled_at on a link and its owner', () => {
    const link = {
      id: '7311234567890123458',
      code: 'abc',
      short_url: 'https://s.test/abc',
      original_url: 'https://example.com',
      clicks: 0,
      owner: { id: user.id, email: user.email, disabled_at: '2026-10-18T10:00:00Z' },
      disabled_at: null,
      expires_at: null,
      created_at: '2026-10-01T00:00:00Z',
    };
    expect(adminLinkSchema.parse(link).owner.disabled_at).toBe('2026-10-18T10:00:00Z');
  });

  it('parses a system audit entry and an action the GUI does not know yet', () => {
    const entry = auditEntrySchema.parse({
      id: '1',
      actor: null,
      action: 'admin.something_new',
      resource_type: 'user',
      resource_id: user.id,
      metadata: {},
      created_at: '2026-10-18T10:00:00Z',
    });
    expect(entry.actor).toBeNull();
    expect(entry.action).toBe('admin.something_new');
  });
});

describe('filter schemas', () => {
  it('falls back to no filter for junk in the URL', () => {
    expect(userFiltersSchema.parse({ q: ['a', 'b'], status: 'nope' })).toEqual({
      q: '',
      status: undefined,
    });
    expect(linkFiltersSchema.parse({})).toEqual({ q: '', status: undefined });
    expect(auditFiltersSchema.parse({ resource_type: 'x', actor_id: '12a' })).toEqual({
      resource_type: undefined,
      actor_id: undefined,
    });
    expect(statsFiltersSchema.parse({ days: '45' })).toEqual({ days: '30' });
  });

  it('trims the search text and keeps a valid status', () => {
    expect(linkFiltersSchema.parse({ q: '  abc ', status: 'expired' })).toEqual({
      q: 'abc',
      status: 'expired',
    });
  });
});

describe('isReasonWithinMax', () => {
  it('counts UTF-8 bytes, not characters', () => {
    expect(isReasonWithinMax('a'.repeat(500))).toBe(true);
    expect(isReasonWithinMax('é'.repeat(251))).toBe(false);
  });
});
