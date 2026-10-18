import { describe, expect, it, vi } from 'vitest';

import { renderHook } from '@/test/utils';

import { useAdminUsers } from '../model/users-api';
import { useUrlFilters } from './use-url-filters';
import { useUsersTableViewModel } from './use-users-table-view-model';

vi.mock('../model/users-api', () => ({ useAdminUsers: vi.fn() }));
vi.mock('./use-url-filters', () => ({ useUrlFilters: vi.fn() }));

describe('useUsersTableViewModel', () => {
  it('queries with the URL filters and flattens the pages', () => {
    vi.mocked(useUrlFilters).mockReturnValue(vi.fn());
    vi.mocked(useAdminUsers).mockReturnValue({
      status: 'success',
      data: {
        pages: [{ users: [{ id: '1' }] }, { users: [{ id: '2' }] }],
        pageParams: ['', 'c1'],
      },
      hasNextPage: false,
      isFetchingNextPage: false,
      isRefetching: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
    } as unknown as ReturnType<typeof useAdminUsers>);

    const filters = { q: 'a@b', status: 'disabled' as const };
    const { state } = renderHook(() => useUsersTableViewModel(filters)).result.current;

    expect(useAdminUsers).toHaveBeenCalledWith(filters);
    if (state.status !== 'success') throw new Error(`unexpected ${state.status}`);
    expect(state.items.map((user) => user.id)).toEqual(['1', '2']);
  });
});
