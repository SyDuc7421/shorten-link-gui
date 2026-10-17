import { HttpError } from '@/lib/http';

/** Failures every auth request can hit, shown at form level. */
export type CommonAuthReason = 'tooManyAttempts' | 'network' | 'server';

/** The fallback once an endpoint's own statuses are handled. */
export function toCommonAuthReason(error: unknown): CommonAuthReason {
  if (!(error instanceof HttpError)) return 'network';
  if (error.status === 429) return 'tooManyAttempts';
  return 'server';
}

/** Where a failed sign-in or registration should be reported, and why. */
export type AuthFailure =
  | { field: 'root'; reason: 'invalidCredentials' | CommonAuthReason }
  | { field: 'email'; reason: 'emailTaken' }
  | { field: 'password'; reason: 'weakPassword' };

export function toAuthFailure(error: unknown, mode: 'signIn' | 'register'): AuthFailure {
  if (error instanceof HttpError) {
    if (error.status === 401) return { field: 'root', reason: 'invalidCredentials' };
    if (error.status === 409) return { field: 'email', reason: 'emailTaken' };
    if (error.status === 400 && mode === 'register') {
      return { field: 'password', reason: 'weakPassword' };
    }
  }
  return { field: 'root', reason: toCommonAuthReason(error) };
}
