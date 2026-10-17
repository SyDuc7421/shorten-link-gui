import { describe, expect, it } from 'vitest';

import { HttpError } from '@/lib/http';

import { toAuthFailure } from './auth-errors';

describe('toAuthFailure', () => {
  it('reports wrong credentials at form level', () => {
    expect(toAuthFailure(new HttpError(401, null), 'signIn')).toEqual({
      field: 'root',
      reason: 'invalidCredentials',
    });
  });

  it('puts a taken email on the email field', () => {
    expect(toAuthFailure(new HttpError(409, null), 'register')).toEqual({
      field: 'email',
      reason: 'emailTaken',
    });
  });

  it('treats 400 as a weak password only when registering', () => {
    expect(toAuthFailure(new HttpError(400, null), 'register').field).toBe('password');
    expect(toAuthFailure(new HttpError(400, null), 'signIn')).toEqual({
      field: 'root',
      reason: 'server',
    });
  });

  it('separates rate limits and network failures', () => {
    expect(toAuthFailure(new HttpError(429, null), 'signIn').reason).toBe('tooManyAttempts');
    expect(toAuthFailure(new TypeError('offline'), 'signIn').reason).toBe('network');
  });
});
