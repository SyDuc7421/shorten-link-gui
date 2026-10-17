import { describe, expect, it } from 'vitest';

import { HttpError } from '@/lib/http';

import { toForgotPasswordFailure, toResetPasswordFailure } from './password-reset-errors';

describe('toForgotPasswordFailure', () => {
  it.each([
    [new HttpError(429, null), 'tooManyAttempts'],
    [new HttpError(500, null), 'server'],
    [new HttpError(400, null), 'server'],
    [new TypeError('offline'), 'network'],
  ])('maps %o to %s', (error, reason) => {
    expect(toForgotPasswordFailure(error)).toEqual({ field: 'root', reason });
  });
});

describe('toResetPasswordFailure', () => {
  it.each([
    [new HttpError(401, { error: 'invalid or expired reset token' }), 'token', 'invalidToken'],
    [new HttpError(400, null), 'password', 'weakPassword'],
    [new HttpError(429, null), 'root', 'tooManyAttempts'],
    [new HttpError(500, null), 'root', 'server'],
    [new TypeError('offline'), 'root', 'network'],
  ])('maps %o', (error, field, reason) => {
    expect(toResetPasswordFailure(error)).toEqual({ field, reason });
  });
});
