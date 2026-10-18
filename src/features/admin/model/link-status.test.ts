import { describe, expect, it } from 'vitest';

import { getAdminLinkStatus } from './link-status';

const now = new Date('2026-10-18T12:00:00Z');
const base = {
  disabled_at: null,
  expires_at: null,
  owner: { id: '1', email: 'a@b.co', disabled_at: null },
};

describe('getAdminLinkStatus', () => {
  it('is active when nothing stops it', () => {
    expect(getAdminLinkStatus(base, now)).toBe('active');
  });

  it('puts an admin disable before everything else', () => {
    expect(
      getAdminLinkStatus(
        {
          ...base,
          disabled_at: '2026-10-18T00:00:00Z',
          expires_at: '2026-10-01T00:00:00Z',
          owner: { ...base.owner, disabled_at: '2026-10-18T00:00:00Z' },
        },
        now,
      ),
    ).toBe('disabled');
  });

  it('reports a disabled owner before expiry', () => {
    expect(
      getAdminLinkStatus(
        {
          ...base,
          expires_at: '2026-10-01T00:00:00Z',
          owner: { ...base.owner, disabled_at: '2026-10-18T00:00:00Z' },
        },
        now,
      ),
    ).toBe('ownerDisabled');
  });

  it('is expired at the expiry instant', () => {
    expect(getAdminLinkStatus({ ...base, expires_at: '2026-10-18T12:00:00Z' }, now)).toBe(
      'expired',
    );
  });
});
