import { describe, expect, it } from 'vitest';

import { HttpError } from '@/lib/http';

import { hasStatus, toAdminFailure } from './admin-errors';

describe('toAdminFailure', () => {
  it.each([
    [409, 'selfDisable'],
    [404, 'notFound'],
    [403, 'forbidden'],
    [413, 'reasonTooLong'],
    [400, 'invalid'],
    [500, 'server'],
  ] as const)('maps %i to %s', (status, failure) => {
    expect(toAdminFailure(new HttpError(status, { error: 'x' }))).toBe(failure);
  });

  it('treats a failed fetch as a network problem', () => {
    expect(toAdminFailure(new TypeError('Failed to fetch'))).toBe('network');
  });

  it('treats an unexpected response shape as a server problem', () => {
    expect(toAdminFailure(new Error('zod'))).toBe('server');
  });
});

describe('hasStatus', () => {
  it('matches only an HttpError with that status', () => {
    expect(hasStatus(new HttpError(404, null), 404)).toBe(true);
    expect(hasStatus(new HttpError(403, null), 404)).toBe(false);
    expect(hasStatus(new Error('x'), 404)).toBe(false);
  });
});
