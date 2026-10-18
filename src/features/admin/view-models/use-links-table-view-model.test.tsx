import { describe, expect, it, vi } from 'vitest';

import { renderHook } from '@/test/utils';

import { useAdminLinks } from '../model/links-api';
import { useLinksTableViewModel } from './use-links-table-view-model';
import { useUrlFilters } from './use-url-filters';

vi.mock('../model/links-api', () => ({ useAdminLinks: vi.fn() }));
vi.mock('./use-url-filters', () => ({ useUrlFilters: vi.fn() }));

const owner = { id: '1', email: 'a@b.co', disabled_at: '2026-10-18T00:00:00Z' };

describe('useLinksTableViewModel', () => {
  it('passes the owner filter through and labels each row with its status', () => {
    vi.mocked(useUrlFilters).mockReturnValue(vi.fn());
    vi.mocked(useAdminLinks).mockReturnValue({
      status: 'success',
      data: {
        pages: [{ links: [{ code: 'abc', disabled_at: null, expires_at: null, owner }] }],
        pageParams: [''],
      },
      hasNextPage: false,
      isFetchingNextPage: false,
      isRefetching: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
    } as unknown as ReturnType<typeof useAdminLinks>);

    const query = { q: '', status: undefined, userId: '1' };
    const { state } = renderHook(() => useLinksTableViewModel(query)).result.current;

    expect(useAdminLinks).toHaveBeenCalledWith(query);
    if (state.status !== 'success') throw new Error(`unexpected ${state.status}`);
    expect(state.items[0]?.status).toBe('ownerDisabled');
  });
});
