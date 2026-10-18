'use client';

import { hasStatus } from '../model/admin-errors';
import { useAdminMe } from '../model/me-api';

/**
 * The account menu shows "Admin" once /api/admin/me has answered 200, and
 * keeps it through a failed re-check — unless that re-check says 403.
 */
export function useAdminMenuItemViewModel() {
  const me = useAdminMe();
  return { isVisible: me.data !== undefined && !hasStatus(me.error, 403) };
}
