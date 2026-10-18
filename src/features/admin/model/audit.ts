import { z } from 'zod';

export const AUDIT_ACTIONS = [
  'user.disable',
  'user.enable',
  'user.quota',
  'link.disable',
  'link.enable',
  'link.delete',
  'admin.grant',
  'admin.revoke',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export function isKnownAuditAction(action: string): action is AuditAction {
  return AUDIT_ACTIONS.some((known) => known === action);
}

// Metadata is free-form JSON: a field of the wrong type is dropped, not fatal.
const detailsSchema = z.object({
  reason: z.string().optional().catch(undefined),
  before: z.number().optional().catch(undefined),
  after: z.number().optional().catch(undefined),
  code: z.string().optional().catch(undefined),
});

export type AuditDetails = z.infer<typeof detailsSchema>;

/** `reason` when given, `before`/`after` for a quota change, `code` for links. */
export function getAuditDetails(metadata: Record<string, unknown> | null | undefined) {
  return detailsSchema.parse(metadata ?? {});
}
