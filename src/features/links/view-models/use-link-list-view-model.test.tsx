import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@/test/utils';

import { useLinks } from '../model/links-api';
import type { Link } from '../model/types';
import { useLinkListViewModel } from './use-link-list-view-model';

vi.mock('../model/links-api', () => ({ useLinks: vi.fn() }));

const link: Link = {
  code: 'abc',
  short_url: 'https://short.link/abc',
  original_url: 'https://example.com',
  clicks: 0,
  expires_at: null,
  created_at: '2026-10-01T00:00:00Z',
};

const base = {
  data: undefined,
  status: 'success',
  refetch: vi.fn(),
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  isRefetching: false,
};

function mockLinks(overrides: Record<string, unknown>) {
  vi.mocked(useLinks).mockReturnValue({ ...base, ...overrides } as unknown as ReturnType<
    typeof useLinks
  >);
}

describe('useLinkListViewModel', () => {
  beforeEach(() => vi.mocked(useLinks).mockReset());

  it('is pending while the first page loads', () => {
    mockLinks({ status: 'pending' });
    expect(renderHook(() => useLinkListViewModel()).result.current.state).toEqual({
      status: 'pending',
    });
  });

  it('exposes retry on error', () => {
    mockLinks({ status: 'error' });
    const { state } = renderHook(() => useLinkListViewModel()).result.current;
    if (state.status !== 'error') throw new Error(`unexpected ${state.status}`);
    state.retry();
    expect(base.refetch).toHaveBeenCalledOnce();
  });

  it('is empty when every page is empty', () => {
    mockLinks({ data: { pages: [{ links: [] }] } });
    expect(renderHook(() => useLinkListViewModel()).result.current.state.status).toBe('empty');
  });

  it('flattens pages and separates a refresh from a next-page fetch', () => {
    mockLinks({
      data: { pages: [{ links: [link] }, { links: [{ ...link, code: 'def' }] }] },
      hasNextPage: true,
      isRefetching: true,
      isFetchingNextPage: true,
    });
    const { state } = renderHook(() => useLinkListViewModel()).result.current;
    if (state.status !== 'success') throw new Error(`unexpected ${state.status}`);
    expect(state.links.map((item) => item.code)).toEqual(['abc', 'def']);
    expect(state.isRefreshing).toBe(false);
    state.loadMore();
    expect(base.fetchNextPage).toHaveBeenCalledOnce();
  });
});
