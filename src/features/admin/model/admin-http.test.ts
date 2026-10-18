import { describe, expect, it } from 'vitest';

import { withQuery, withReason } from './admin-http';

describe('withQuery', () => {
  it('skips empty values and encodes the rest', () => {
    expect(withQuery('/api/admin/links', { q: 'a b&c', status: undefined, cursor: '' })).toBe(
      '/api/admin/links?q=a+b%26c',
    );
  });

  it('returns the bare path when nothing is set', () => {
    expect(withQuery('/api/admin/users', { q: '' })).toBe('/api/admin/users');
  });
});

describe('withReason', () => {
  it('sends a reason only when there is one', () => {
    expect(withReason('spam')).toEqual({ reason: 'spam' });
    expect(withReason(null)).toEqual({});
  });
});
