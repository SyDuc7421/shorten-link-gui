import { HttpError } from '@/lib/http';

/** Why an admin request failed — each one has a message in `admin.errors`. */
export type AdminFailure =
  'selfDisable' | 'notFound' | 'forbidden' | 'invalid' | 'reasonTooLong' | 'network' | 'server';

export function hasStatus(error: unknown, status: number) {
  return error instanceof HttpError && error.status === status;
}

export function toAdminFailure(error: unknown): AdminFailure {
  // fetch rejects with a TypeError when the request never reached the server.
  if (error instanceof TypeError) return 'network';
  if (!(error instanceof HttpError)) return 'server';

  switch (error.status) {
    // The only conflict an admin write returns.
    case 409:
      return 'selfDisable';
    case 404:
      return 'notFound';
    // Admin access was revoked after the page loaded.
    case 403:
      return 'forbidden';
    case 413:
      return 'reasonTooLong';
    case 400:
      return 'invalid';
    default:
      return 'server';
  }
}
