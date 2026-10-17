import { describe, expect, it } from 'vitest';

import { localDateTimeToRfc3339, toDisplayUrl } from './display-url';

describe('toDisplayUrl', () => {
  it('drops the scheme', () => {
    expect(toDisplayUrl('https://short.link/aB3xY9z')).toBe('short.link/aB3xY9z');
    expect(toDisplayUrl('http://localhost:8080/aB3xY9z')).toBe('localhost:8080/aB3xY9z');
  });
});

describe('localDateTimeToRfc3339', () => {
  it('produces RFC 3339 without fractional seconds', () => {
    expect(localDateTimeToRfc3339('2030-01-02T03:04')).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
    );
  });
});
