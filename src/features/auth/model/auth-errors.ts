import { HttpError } from '@/lib/http';

/** Where a failed sign-in or registration should be reported, and why. */
export type AuthFailure =
  | { field: 'root'; reason: 'invalidCredentials' | 'tooManyAttempts' | 'network' | 'server' }
  | { field: 'email'; reason: 'emailTaken' }
  | { field: 'password'; reason: 'weakPassword' };

export function toAuthFailure(error: unknown, mode: 'signIn' | 'register'): AuthFailure {
  if (!(error instanceof HttpError)) return { field: 'root', reason: 'network' };
  if (error.status === 401) return { field: 'root', reason: 'invalidCredentials' };
  if (error.status === 409) return { field: 'email', reason: 'emailTaken' };
  if (error.status === 400 && mode === 'register') {
    return { field: 'password', reason: 'weakPassword' };
  }
  if (error.status === 429) return { field: 'root', reason: 'tooManyAttempts' };
  return { field: 'root', reason: 'server' };
}
