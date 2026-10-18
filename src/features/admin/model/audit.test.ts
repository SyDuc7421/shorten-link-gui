import { describe, expect, it } from 'vitest';

import { getAuditDetails, isKnownAuditAction } from './audit';

describe('getAuditDetails', () => {
  it('reads reason, quota change and code', () => {
    expect(getAuditDetails({ reason: 'spam', before: 50, after: 0, code: 'abc' })).toEqual({
      reason: 'spam',
      before: 50,
      after: 0,
      code: 'abc',
    });
  });

  it('drops fields of the wrong type instead of failing the row', () => {
    expect(getAuditDetails({ reason: 3, before: '50' })).toEqual({
      reason: undefined,
      before: undefined,
      after: undefined,
      code: undefined,
    });
    expect(getAuditDetails(null)).toEqual({
      reason: undefined,
      before: undefined,
      after: undefined,
      code: undefined,
    });
  });
});

describe('isKnownAuditAction', () => {
  it('knows the actions the spec lists and nothing else', () => {
    expect(isKnownAuditAction('link.disable')).toBe(true);
    expect(isKnownAuditAction('admin.revoke')).toBe(true);
    expect(isKnownAuditAction('link.rename')).toBe(false);
  });
});
