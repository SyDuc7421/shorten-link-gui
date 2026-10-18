import { describe, expect, it } from 'vitest';

import { sumDaily } from './stats';

describe('sumDaily', () => {
  it('adds every day in the range', () => {
    expect(
      sumDaily([
        { date: '2026-10-17', new_users: 1, new_links: 2, clicks: 3 },
        { date: '2026-10-18', new_users: 4, new_links: 5, clicks: 6 },
      ]),
    ).toEqual({ new_users: 5, new_links: 7, clicks: 9 });
  });

  it('is zero for an empty range', () => {
    expect(sumDaily([])).toEqual({ new_users: 0, new_links: 0, clicks: 0 });
  });
});
