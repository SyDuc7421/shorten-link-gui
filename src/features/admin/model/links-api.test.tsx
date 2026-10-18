import { QueryClient, QueryClientProvider, type InfiniteData } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { authedHttp } from '@/features/auth';
import { HttpError } from '@/lib/http';

import { useAdminLinks, useDeleteAdminLink, useSetLinkDisabled } from './links-api';
import { adminKeys } from './query-keys';
import type { AdminLink, LinkPage } from './types';

vi.mock('@/features/auth', () => ({ authedHttp: vi.fn() }));

const link: AdminLink = {
  id: '7311234567890123458',
  code: 'abc',
  short_url: 'https://s.test/abc',
  original_url: 'https://example.com',
  clicks: 3,
  owner: { id: '7311234567890123457', email: 'owner@example.com', disabled_at: null },
  disabled_at: null,
  expires_at: null,
  created_at: '2026-10-01T00:00:00Z',
};

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { queryClient, wrapper };
}

function seed(queryClient: QueryClient) {
  const key = adminKeys.linkList({ q: '', status: 'active' });
  queryClient.setQueryData<InfiniteData<LinkPage>>(key, {
    pages: [{ links: [link], next_cursor: '' }],
    pageParams: [''],
  });
  return key;
}

describe('useAdminLinks', () => {
  it('sends the filters and the cursor, and stops on an empty next_cursor', async () => {
    vi.mocked(authedHttp)
      .mockResolvedValueOnce({ links: [link], next_cursor: 'c1' })
      .mockResolvedValueOnce({ links: [{ ...link, id: '2', code: 'def' }], next_cursor: '' });
    const { wrapper } = setup();

    const { result } = renderHook(
      () => useAdminLinks({ q: 'abc', status: 'active', userId: '42' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authedHttp).toHaveBeenLastCalledWith('/api/admin/links?q=abc&status=active&user_id=42');

    // The hook only re-renders for fields it has read, so assert on the fetch's own result.
    const next = await act(() => result.current.fetchNextPage());
    expect(authedHttp).toHaveBeenLastCalledWith(
      '/api/admin/links?q=abc&status=active&user_id=42&cursor=c1',
    );
    expect(next.hasNextPage).toBe(false);
  });
});

describe('useSetLinkDisabled', () => {
  it('writes the server row into cached lists and marks them stale', async () => {
    const { queryClient, wrapper } = setup();
    const key = seed(queryClient);
    const disabled = { ...link, disabled_at: '2026-10-18T10:00:00Z' };
    vi.mocked(authedHttp).mockResolvedValueOnce(disabled);

    const { result } = renderHook(() => useSetLinkDisabled(), { wrapper });
    await act(() => result.current.mutateAsync({ code: 'abc', isDisabled: true, reason: 'phish' }));

    expect(authedHttp).toHaveBeenCalledWith('/api/admin/links/abc/disable', {
      method: 'POST',
      body: { reason: 'phish' },
    });
    const cached = queryClient.getQueryData<InfiniteData<LinkPage>>(key);
    expect(cached?.pages[0]?.links[0]?.disabled_at).toBe(disabled.disabled_at);
    expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
  });

  it('does not invalidate who the admin is', async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(adminKeys.me(), { id: '1', email: 'a@b.co', role: 'admin' });
    vi.mocked(authedHttp).mockResolvedValueOnce(link);

    const { result } = renderHook(() => useSetLinkDisabled(), { wrapper });
    await act(() => result.current.mutateAsync({ code: 'abc', isDisabled: false, reason: null }));

    expect(authedHttp).toHaveBeenCalledWith('/api/admin/links/abc/enable', {
      method: 'POST',
      body: {},
    });
    expect(queryClient.getQueryState(adminKeys.me())?.isInvalidated).toBe(false);
  });
});

describe('useDeleteAdminLink', () => {
  it('treats an already-deleted link as done and removes the row', async () => {
    const { queryClient, wrapper } = setup();
    const key = seed(queryClient);
    vi.mocked(authedHttp).mockRejectedValueOnce(new HttpError(404, { error: 'not found' }));

    const { result } = renderHook(() => useDeleteAdminLink(), { wrapper });
    await act(() => result.current.mutateAsync({ code: 'abc', reason: null }));

    expect(queryClient.getQueryData<InfiniteData<LinkPage>>(key)?.pages[0]?.links).toEqual([]);
  });
});
