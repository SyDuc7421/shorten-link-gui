import { describe, expect, it, vi } from 'vitest';

import { HttpError } from '@/lib/http';
import { renderHook } from '@/test/utils';

import { useAdminMe } from '../model/me-api';
import { useAdminMenuItemViewModel } from './use-admin-menu-item-view-model';

vi.mock('../model/me-api', () => ({ useAdminMe: vi.fn() }));

const admin = { id: '1', email: 'admin@example.com', role: 'admin' };

function isVisibleFor(me: Record<string, unknown>) {
  vi.mocked(useAdminMe).mockReturnValue(me as unknown as ReturnType<typeof useAdminMe>);
  return renderHook(() => useAdminMenuItemViewModel()).result.current.isVisible;
}

describe('useAdminMenuItemViewModel', () => {
  it('shows the entry for an admin', () => {
    expect(isVisibleFor({ status: 'success', data: admin })).toBe(true);
  });

  it('keeps the entry when a background re-check fails', () => {
    expect(isVisibleFor({ status: 'error', data: admin, error: new TypeError('offline') })).toBe(
      true,
    );
  });

  it('hides the entry for a non-admin or a revoked admin', () => {
    expect(isVisibleFor({ status: 'error', error: new HttpError(403, null) })).toBe(false);
    expect(isVisibleFor({ status: 'error', data: admin, error: new HttpError(403, null) })).toBe(
      false,
    );
  });
});
