import { z } from 'zod';

// The API sends `id` as a JSON number that exceeds Number.MAX_SAFE_INTEGER, so
// it is deliberately not parsed. `code` is the stable identifier on the client.
export const linkSchema = z.object({
  code: z.string(),
  short_url: z.string(),
  original_url: z.string(),
  clicks: z.number(),
  expires_at: z.string().nullable(),
  created_at: z.string(),
});

export const linkPageSchema = z.object({
  links: z.array(linkSchema),
  /** Empty string when there are no more pages. */
  next_cursor: z.string().nullish(),
});

export const shortenedLinkSchema = z.object({
  code: z.string(),
  short_url: z.string(),
  expires_at: z.string().nullable(),
});

/** Mirrors the API: `aliasPattern` and `reservedAliases` in the link service. */
export const ALIAS_MIN = 3;
export const ALIAS_MAX = 16;
export const ALIAS_PATTERN = /^[A-Za-z0-9_-]{3,16}$/;
/** Paths served by other routes; compared case-insensitively. */
export const RESERVED_ALIASES = ['api', 'docs', 'healthz', 'metrics'] as const;

export const aliasAvailabilitySchema = z.object({
  alias: z.string(),
  available: z.boolean(),
  reason: z.enum(['invalid', 'reserved', 'taken']).optional(),
});

export type AliasAvailability = z.infer<typeof aliasAvailabilitySchema>;
export type Link = z.infer<typeof linkSchema>;
export type LinkPage = z.infer<typeof linkPageSchema>;
export type ShortenedLink = z.infer<typeof shortenedLinkSchema>;

export interface ShortenInput {
  url: string;
  /** Custom short code, or `null` for a generated one. */
  alias: string | null;
  /** RFC 3339 */
  expiresAt: string | null;
}
