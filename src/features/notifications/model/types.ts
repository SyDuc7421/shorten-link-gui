import { z } from 'zod';

export const NOTIFICATION_TYPES = [
  'link_disabled',
  'link_enabled',
  'link_expiring',
  'password_changed',
] as const;

// `link_id` and `code` are null only for `password_changed`.
export const notificationSchema = z.object({
  id: z.string(),
  type: z.enum(NOTIFICATION_TYPES),
  link_id: z.string().nullable(),
  code: z.string().nullable(),
  expires_at: z.string().nullable(),
  read_at: z.string().nullable(),
  created_at: z.string(),
});

export const notificationPageSchema = z.object({
  items: z.array(notificationSchema),
  /** Empty string when there are no more pages. */
  next_cursor: z.string().nullish(),
  /** All unread notifications, not just this page. */
  unread_count: z.number(),
});

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationPage = z.infer<typeof notificationPageSchema>;
