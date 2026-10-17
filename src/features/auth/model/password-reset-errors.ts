import { HttpError } from '@/lib/http';

import { toCommonAuthReason, type CommonAuthReason } from './auth-errors';

/** A failed reset-link request. A well-formed request never fails for an unknown email. */
export interface ForgotPasswordFailure {
  field: 'root';
  reason: CommonAuthReason;
}

export function toForgotPasswordFailure(error: unknown): ForgotPasswordFailure {
  return { field: 'root', reason: toCommonAuthReason(error) };
}

/** A failed password reset: on a field, at form level, or the link itself is dead. */
export type ResetPasswordFailure =
  | { field: 'token'; reason: 'invalidToken' }
  | { field: 'password'; reason: 'weakPassword' }
  | { field: 'root'; reason: CommonAuthReason };

export function toResetPasswordFailure(error: unknown): ResetPasswordFailure {
  if (error instanceof HttpError) {
    if (error.status === 401) return { field: 'token', reason: 'invalidToken' };
    // The API checks the length before it spends the token, so the link still works.
    if (error.status === 400) return { field: 'password', reason: 'weakPassword' };
  }
  return { field: 'root', reason: toCommonAuthReason(error) };
}
