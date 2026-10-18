import { beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@/test/utils';

import { useAuditLog } from '../model/audit-api';
import { useAuditTableViewModel } from './use-audit-table-view-model';
import { useUrlFilters } from './use-url-filters';

vi.mock('../model/audit-api', () => ({ useAuditLog: vi.fn() }));
vi.mock('./use-url-filters', () => ({ useUrlFilters: vi.fn() }));

const setFilters = vi.fn();

const entry = {
  id: '1',
  actor: null,
  resource_type: 'user',
  resource_id: '7311234567890123457',
  created_at: '2026-10-18T10:00:00Z',
};

describe('useAuditTableViewModel', () => {
  beforeEach(() => {
    vi.mocked(useUrlFilters).mockReturnValue(setFilters);
    vi.mocked(useAuditLog).mockReturnValue({
      status: 'success',
      data: {
        pages: [
          {
            entries: [
              { ...entry, action: 'user.quota', metadata: { before: 50, after: 0 } },
              { ...entry, id: '2', action: 'user.rename', metadata: null },
            ],
          },
        ],
        pageParams: [''],
      },
      hasNextPage: false,
      isFetchingNextPage: false,
      isRefetching: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
    } as unknown as ReturnType<typeof useAuditLog>);
  });

  it('reads the details and flags actions the GUI does not know', () => {
    const { state } = renderHook(() =>
      useAuditTableViewModel({ resource_type: undefined, actor_id: undefined }),
    ).result.current;
    if (state.status !== 'success') throw new Error(`unexpected ${state.status}`);
    expect(state.items[0]?.action).toBe('user.quota');
    expect(state.items[0]?.details).toMatchObject({ before: 50, after: 0 });
    expect(state.items[1]?.action).toBeNull();
  });

  it('writes the target filter and clears the admin filter', () => {
    const { result } = renderHook(() =>
      useAuditTableViewModel({ resource_type: 'link', actor_id: '9' }),
    );
    expect(result.current.isActorFiltered).toBe(true);

    act(() => result.current.onResourceTypeChange('all'));
    expect(setFilters).toHaveBeenLastCalledWith({ resource_type: undefined });

    act(() => result.current.clearActor());
    expect(setFilters).toHaveBeenLastCalledWith({ actor_id: undefined });
  });
});
