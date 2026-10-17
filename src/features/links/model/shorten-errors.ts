import { z } from 'zod';

import { HttpError } from '@/lib/http';

/** Where a failed shorten request should be reported, and why. */
export type ShortenFailure =
  | { field: 'url'; reason: 'unresolvableUrl' | 'forbiddenUrl' }
  | { field: 'alias'; reason: 'aliasInvalid' | 'aliasTaken' }
  | { field: 'expiresAt'; reason: 'expiryInPast' }
  | { field: 'root'; reason: 'rateLimited' | 'network' | 'server' };

const errorBodySchema = z.object({ error: z.string() });

export function toShortenFailure(error: unknown): ShortenFailure {
  if (!(error instanceof HttpError)) return { field: 'root', reason: 'network' };

  const parsed = errorBodySchema.safeParse(error.body);
  const message = parsed.success ? parsed.data.error.toLowerCase() : '';

  if (error.status === 400 && message.includes('expires_at')) {
    return { field: 'expiresAt', reason: 'expiryInPast' };
  }
  if (error.status === 400 && message.includes('alias')) {
    return { field: 'alias', reason: 'aliasInvalid' };
  }
  if (error.status === 400) return { field: 'url', reason: 'unresolvableUrl' };
  // The only conflict on create is a custom alias someone already has.
  if (error.status === 409) return { field: 'alias', reason: 'aliasTaken' };
  if (error.status === 422) return { field: 'url', reason: 'forbiddenUrl' };
  if (error.status === 429) return { field: 'root', reason: 'rateLimited' };
  return { field: 'root', reason: 'server' };
}
