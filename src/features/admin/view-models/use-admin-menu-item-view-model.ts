'use client';

import { useAdminMe } from '../model/me-api';

/** The account menu shows "Admin" only when /api/admin/me answers 200. */
export function useAdminMenuItemViewModel() {
  return { isVisible: useAdminMe().isSuccess };
}
