import { beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@/test/utils';

import { useAdminStats } from '../model/stats-api';
import { useAdminDashboardViewModel } from './use-admin-dashboard-view-model';
import { useUrlFilters } from './use-url-filters';

vi.mock('../model/stats-api', () => ({ useAdminStats: vi.fn() }));
vi.mock('./use-url-filters', () => ({ useUrlFilters: vi.fn() }));

const setFilters = vi.fn();
const stats = {
  totals: { users: 2, links: 3, clicks: 9, disabled_users: 0, disabled_links: 1 },
  daily: [
    { date: '2026-10-17', new_users: 1, new_links: 1, clicks: 4 },
    { date: '2026-10-18', new_users: 1, new_links: 2, clicks: 5 },
  ],
  top_links: [],
};

function mockStats(query: Record<string, unknown>) {
  vi.mocked(useAdminStats).mockReturnValue({
    refetch: vi.fn(),
    isPlaceholderData: false,
    ...query,
  } as unknown as ReturnType<typeof useAdminStats>);
}

describe('useAdminDashboardViewModel', () => {
  beforeEach(() => vi.mocked(useUrlFilters).mockReturnValue(setFilters));

  it('sums the selected range', () => {
    mockStats({ status: 'success', data: stats });
    const { state } = renderHook(() => useAdminDashboardViewModel('30')).result.current;
    if (state.status !== 'success') throw new Error(`unexpected ${state.status}`);
    expect(state.rangeTotals).toEqual({ new_users: 2, new_links: 3, clicks: 9 });
  });

  it('keeps the old numbers, dimmed, while another range loads', () => {
    mockStats({ status: 'success', data: stats, isPlaceholderData: true });
    const { state } = renderHook(() => useAdminDashboardViewModel('7')).result.current;
    if (state.status !== 'success') throw new Error(`unexpected ${state.status}`);
    expect(state.isRefreshing).toBe(true);
  });

  it('drops the default range from the URL', () => {
    mockStats({ status: 'pending' });
    const { result } = renderHook(() => useAdminDashboardViewModel('7'));
    act(() => result.current.onDaysChange('30'));
    expect(setFilters).toHaveBeenLastCalledWith({ days: undefined });
    act(() => result.current.onDaysChange('90'));
    expect(setFilters).toHaveBeenLastCalledWith({ days: '90' });
  });
});
