import { z } from 'zod';

/**
 * Fail fast on missing configuration. Next.js inlines NEXT_PUBLIC_* at build
 * time, so they must be referenced explicitly — not via a computed key.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_API_URL: z.url(),
});

const serverSchema = clientSchema.extend({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const clientValues = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
};

const parsed =
  typeof window === 'undefined'
    ? serverSchema.safeParse({ ...clientValues, NODE_ENV: process.env.NODE_ENV })
    : clientSchema.safeParse(clientValues);

if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
