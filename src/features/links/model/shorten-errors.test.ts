import { describe, expect, it } from 'vitest';

import { HttpError } from '@/lib/http';

import { toShortenFailure } from './shorten-errors';

describe('toShortenFailure', () => {
  it.each([
    [
      new HttpError(400, { error: 'invalid expires_at' }),
      { field: 'expiresAt', reason: 'expiryInPast' },
    ],
    [
      new HttpError(400, { error: 'cannot resolve host' }),
      { field: 'url', reason: 'unresolvableUrl' },
    ],
    [new HttpError(400, null), { field: 'url', reason: 'unresolvableUrl' }],
    [new HttpError(422, {}), { field: 'url', reason: 'forbiddenUrl' }],
    [new HttpError(429, {}), { field: 'root', reason: 'rateLimited' }],
    [new HttpError(500, {}), { field: 'root', reason: 'server' }],
    [new TypeError('Failed to fetch'), { field: 'root', reason: 'network' }],
  ])('maps %o', (error, expected) => {
    expect(toShortenFailure(error)).toEqual(expected);
  });
});
