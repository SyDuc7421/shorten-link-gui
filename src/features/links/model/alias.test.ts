import { describe, expect, it } from 'vitest';

import { getAliasProblem } from './alias';

describe('getAliasProblem', () => {
  it.each(['abc', 'Sale-2026', 'a_b-c', 'x'.repeat(16)])('accepts %s', (alias) => {
    expect(getAliasProblem(alias)).toBeNull();
  });

  it.each(['ab', 'x'.repeat(17), 'has space', 'ünï', 'a/b', 'a.b'])('rejects %s', (alias) => {
    expect(getAliasProblem(alias)).toBe('invalid');
  });

  it.each(['api', 'API', 'Docs', 'healthz', 'metrics'])('reserves %s in any case', (alias) => {
    expect(getAliasProblem(alias)).toBe('reserved');
  });
});
