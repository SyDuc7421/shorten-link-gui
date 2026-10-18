import { QueryClient, QueryClientProvider, type InfiniteData } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { authedHttp } from '@/features/auth';

import { adminKeys } from './query-keys';
import type { AdminUserDetail, UserPage } from './types';
import { useSetUserDisabled, useUpdateUserQuota } from './users-api';

vi.mock('@/features/auth', () => ({ authedHttp: vi.fn() }));

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

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { queryClient, wrapper };
}

describe('useSetUserDisabled', () => {
  it('updates the detail and every cached list row from the response', async () => {
    const { queryClient, wrapper } = setup();
    const listKey = adminKeys.userList({ q: '', status: undefined });
    queryClient.setQueryData<InfiniteData<UserPage>>(listKey, {
      pages: [{ users: [user], next_cursor: '' }],
      pageParams: [''],
    });
    const disabled = { ...user, disabled_at: '2026-10-18T10:00:00Z' };
    vi.mocked(authedHttp).mockResolvedValueOnce(disabled);

    const { result } = renderHook(() => useSetUserDisabled(), { wrapper });
    await act(() => result.current.mutateAsync({ id: user.id, isDisabled: true, reason: null }));

    expect(authedHttp).toHaveBeenCalledWith(`/api/admin/users/${user.id}/disable`, {
      method: 'POST',
      body: {},
    });
    expect(queryClient.getQueryData<AdminUserDetail>(adminKeys.user(user.id))?.disabled_at).toBe(
      disabled.disabled_at,
    );
    expect(
      queryClient.getQueryData<InfiniteData<UserPage>>(listKey)?.pages[0]?.users[0]?.disabled_at,
    ).toBe(disabled.disabled_at);
  });
});

describe('useUpdateUserQuota', () => {
  it('sends quota_daily and the reason', async () => {
    const { wrapper } = setup();
    vi.mocked(authedHttp).mockResolvedValueOnce({ ...user, quota_daily: 0 });

    const { result } = renderHook(() => useUpdateUserQuota(), { wrapper });
    await act(() => result.current.mutateAsync({ id: user.id, quotaDaily: 0, reason: 'spam' }));

    expect(authedHttp).toHaveBeenCalledWith(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      body: { quota_daily: 0, reason: 'spam' },
    });
  });
});
