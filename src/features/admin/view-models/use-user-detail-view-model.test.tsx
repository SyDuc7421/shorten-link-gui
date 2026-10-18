import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '@/lib/http';
import { renderHook } from '@/test/utils';

import { useAdminMe } from '../model/me-api';
import type { AdminUserDetail } from '../model/types';
import { useAdminUser, useSetUserDisabled } from '../model/users-api';
import { useUserDetailViewModel } from './use-user-detail-view-model';

vi.mock('../model/users-api', () => ({ useAdminUser: vi.fn(), useSetUserDisabled: vi.fn() }));
vi.mock('../model/me-api', () => ({ useAdminMe: vi.fn() }));

const user: AdminUserDetail = {
  id: '7311234567890123457',
  email: 'owner@example.com',
  role: 'user',
  quota_daily: 50,
  disabled_at: null,
  created_at: '2026-09-01T00:00:00Z',
  link_count: 3,
  links_today: 1,
  total_clicks: 12,
};

const mutateAsync = vi.fn();

function mockUser(query: Record<string, unknown>, meId = '1') {
  vi.mocked(useAdminUser).mockReturnValue({ refetch: vi.fn(), ...query } as unknown as ReturnType<
    typeof useAdminUser
  >);
  vi.mocked(useAdminMe).mockReturnValue({
    data: { id: meId, email: 'admin@example.com', role: 'admin' },
  } as unknown as ReturnType<typeof useAdminMe>);
}

describe('useUserDetailViewModel', () => {
  beforeEach(() => {
    vi.mocked(useSetUserDisabled).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useSetUserDisabled>);
  });

  it('tells "no such user" apart from a failed load', () => {
    mockUser({ status: 'error', error: new HttpError(404, null) });
    expect(renderHook(() => useUserDetailViewModel(user.id)).result.current.state.status).toBe(
      'notFound',
    );

    mockUser({ status: 'error', error: new TypeError('offline') });
    expect(renderHook(() => useUserDetailViewModel(user.id)).result.current.state.status).toBe(
      'error',
    );
  });

  it('marks the admin’s own account so the view hides disable', () => {
    mockUser({ status: 'success', data: user }, user.id);
    const { state } = renderHook(() => useUserDetailViewModel(user.id)).result.current;
    if (state.status !== 'success') throw new Error(`unexpected ${state.status}`);
    expect(state.isSelf).toBe(true);
  });

  it('disables an enabled user and enables a disabled one', () => {
    mockUser({ status: 'success', data: user });
    let { state } = renderHook(() => useUserDetailViewModel(user.id)).result.current;
    if (state.status !== 'success') throw new Error(`unexpected ${state.status}`);
    void state.toggleDisabled('spam');
    expect(mutateAsync).toHaveBeenLastCalledWith({ id: user.id, isDisabled: true, reason: 'spam' });

    mockUser({ status: 'success', data: { ...user, disabled_at: '2026-10-18T10:00:00Z' } });
    ({ state } = renderHook(() => useUserDetailViewModel(user.id)).result.current);
    if (state.status !== 'success') throw new Error(`unexpected ${state.status}`);
    void state.toggleDisabled(null);
    expect(mutateAsync).toHaveBeenLastCalledWith({ id: user.id, isDisabled: false, reason: null });
  });
});
