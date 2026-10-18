import { describe, expect, it, vi } from 'vitest';

import { toPagedListState } from './paged-list-state';

interface Page {
  items: string[];
}

const base = {
  data: undefined,
  status: 'success' as const,
  hasNextPage: false,
  isFetchingNextPage: false,
  isRefetching: false,
  refetch: vi.fn(),
  fetchNextPage: vi.fn(),
};

const select = (page: Page) => page.items;

describe('toPagedListState', () => {
  it('is pending before the first page', () => {
    expect(toPagedListState<Page, string>({ ...base, status: 'pending' }, select)).toEqual({
      status: 'pending',
    });
  });

  it('offers retry when the first load fails', () => {
    const state = toPagedListState<Page, string>({ ...base, status: 'error' }, select);
    if (state.status !== 'error') throw new Error(`unexpected ${state.status}`);
    state.retry();
    expect(base.refetch).toHaveBeenCalledOnce();
  });

  it('keeps the rows on screen when a background refetch fails', () => {
    const state = toPagedListState<Page, string>(
      { ...base, status: 'error', data: { pages: [{ items: ['a'] }], pageParams: [''] } },
      select,
    );
    expect(state.status).toBe('success');
  });

  it('is empty when every page is empty', () => {
    expect(
      toPagedListState<Page, string>(
        { ...base, data: { pages: [{ items: [] }], pageParams: [''] } },
        select,
      ).status,
    ).toBe('empty');
  });

  it('flattens pages and tells a refresh apart from a next page', () => {
    const state = toPagedListState<Page, string>(
      {
        ...base,
        data: { pages: [{ items: ['a'] }, { items: ['b'] }], pageParams: ['', 'c1'] },
        hasNextPage: true,
        isRefetching: true,
        isFetchingNextPage: true,
      },
      select,
    );
    if (state.status !== 'success') throw new Error(`unexpected ${state.status}`);
    expect(state.items).toEqual(['a', 'b']);
    expect(state.isRefreshing).toBe(false);
    state.loadMore();
    expect(base.fetchNextPage).toHaveBeenCalledOnce();
  });
});
