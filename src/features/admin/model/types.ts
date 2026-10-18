import { z } from 'zod';

/** Snowflake IDs exceed 2^53, so the admin API sends every ID as a string. */
export const idSchema = z.string().regex(/^\d+$/);

const nullableTime = z.string().nullable();

export const USER_STATUSES = ['active', 'disabled'] as const;
export const LINK_STATUSES = ['active', 'disabled', 'expired'] as const;
export const RESOURCE_TYPES = ['user', 'link'] as const;
/** Ranges the dashboard offers. The API accepts 1–90 days. */
export const STATS_RANGES = ['7', '30', '90'] as const;
export const DEFAULT_STATS_RANGE = '30';

/** Mirror the API: PATCH /api/admin/users/{id} and the optional reason body. */
export const QUOTA_MIN = 0;
export const QUOTA_MAX = 100_000;
export const REASON_MAX_BYTES = 500;

/** The API limits the reason in bytes; accented letters and emoji take 2–4. */
export function isReasonWithinMax(reason: string) {
  return new TextEncoder().encode(reason).length <= REASON_MAX_BYTES;
}

export const adminMeSchema = z.object({
  id: idSchema,
  email: z.string(),
  role: z.literal('admin'),
});

export const adminUserSchema = z.object({
  id: idSchema,
  email: z.string(),
  role: z.enum(['user', 'admin']),
  quota_daily: z.number().int(),
  disabled_at: nullableTime,
  created_at: z.string(),
  link_count: z.number().int(),
});

export const adminUserDetailSchema = adminUserSchema.extend({
  /** Links created since 00:00 UTC. */
  links_today: z.number().int(),
  total_clicks: z.number().int(),
});

export const userPageSchema = z.object({
  users: z.array(adminUserSchema),
  /** Empty string on the last page. */
  next_cursor: z.string().nullish(),
});

export const adminLinkSchema = z.object({
  id: idSchema,
  code: z.string(),
  short_url: z.string(),
  original_url: z.string(),
  clicks: z.number().int(),
  owner: z.object({ id: idSchema, email: z.string(), disabled_at: nullableTime }),
  disabled_at: nullableTime,
  expires_at: nullableTime,
  created_at: z.string(),
});

export const linkPageSchema = z.object({
  links: z.array(adminLinkSchema),
  next_cursor: z.string().nullish(),
});

export const auditEntrySchema = z.object({
  id: idSchema,
  /** `null` for entries written by the `server admin` command. */
  actor: z.object({ id: idSchema, email: z.string() }).nullable(),
  // Open strings: an action or resource type added to the API later still renders.
  action: z.string(),
  resource_type: z.string(),
  resource_id: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
  created_at: z.string(),
});

export const auditPageSchema = z.object({
  entries: z.array(auditEntrySchema),
  next_cursor: z.string().nullish(),
});

const count = z.number().int();

export const dailyStatSchema = z.object({
  /** `YYYY-MM-DD`, a UTC day. */
  date: z.string(),
  new_users: count,
  new_links: count,
  clicks: count,
});

export const adminStatsSchema = z.object({
  totals: z.object({
    users: count,
    links: count,
    clicks: count,
    disabled_users: count,
    disabled_links: count,
  }),
  /** One entry per day, oldest first, zeros filled in. */
  daily: z.array(dailyStatSchema),
  /** Top 10 by clicks within the range. */
  top_links: z.array(z.object({ code: z.string(), clicks: count })),
});

// URL search params: anything unexpected falls back to "no filter".
const searchText = z.string().trim().max(200).catch('');

export const userFiltersSchema = z.object({
  q: searchText,
  status: z.enum(USER_STATUSES).optional().catch(undefined),
});

export const linkFiltersSchema = z.object({
  q: searchText,
  status: z.enum(LINK_STATUSES).optional().catch(undefined),
});

export const auditFiltersSchema = z.object({
  resource_type: z.enum(RESOURCE_TYPES).optional().catch(undefined),
  actor_id: idSchema.optional().catch(undefined),
});

export const statsFiltersSchema = z.object({
  days: z.enum(STATS_RANGES).catch(DEFAULT_STATS_RANGE),
});

export type AdminMe = z.infer<typeof adminMeSchema>;
export type AdminUser = z.infer<typeof adminUserSchema>;
export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;
export type UserPage = z.infer<typeof userPageSchema>;
export type AdminLink = z.infer<typeof adminLinkSchema>;
export type LinkPage = z.infer<typeof linkPageSchema>;
export type AuditEntry = z.infer<typeof auditEntrySchema>;
export type AuditPage = z.infer<typeof auditPageSchema>;
export type AdminStats = z.infer<typeof adminStatsSchema>;
export type DailyStat = z.infer<typeof dailyStatSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
export type LinkFilters = z.infer<typeof linkFiltersSchema>;
export type AuditFilters = z.infer<typeof auditFiltersSchema>;
export type StatsRange = (typeof STATS_RANGES)[number];

/** Link list filters, optionally narrowed to one owner (user detail page). */
export type LinkQuery = LinkFilters & { userId?: string };
