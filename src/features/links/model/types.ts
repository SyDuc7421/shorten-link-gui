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

export type Link = z.infer<typeof linkSchema>;
export type LinkPage = z.infer<typeof linkPageSchema>;
export type ShortenedLink = z.infer<typeof shortenedLinkSchema>;

export interface ShortenInput {
  url: string;
  /** RFC 3339 */
  expiresAt: string | null;
}
