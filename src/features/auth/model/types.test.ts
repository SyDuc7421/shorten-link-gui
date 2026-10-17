import { describe, expect, it } from 'vitest';

import { isPasswordWithinMax, PASSWORD_MAX_BYTES } from './types';

describe('isPasswordWithinMax', () => {
  it('counts UTF-8 bytes, not characters, like the API', () => {
    expect(isPasswordWithinMax('a'.repeat(PASSWORD_MAX_BYTES))).toBe(true);
    expect(isPasswordWithinMax('a'.repeat(PASSWORD_MAX_BYTES + 1))).toBe(false);
    // 30 characters of 3-byte Vietnamese letters = 90 bytes.
    expect(isPasswordWithinMax('ậ'.repeat(30))).toBe(false);
    // 18 emoji × 4 bytes = 72 bytes.
    expect(isPasswordWithinMax('🔑'.repeat(18))).toBe(true);
  });
});
