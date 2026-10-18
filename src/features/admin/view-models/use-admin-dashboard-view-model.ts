'use client';

import { sumDaily, type RangeTotals } from '../model/stats';
import { useAdminStats } from '../model/stats-api';
import { DEFAULT_STATS_RANGE, type AdminStats, type StatsRange } from '../model/types';
import { useUrlFilters } from './use-url-filters';

export type DashboardState =
  | { status: 'pending' }
  | { status: 'error'; retry: () => void }
  | { status: 'success'; stats: AdminStats; rangeTotals: RangeTotals; isRefreshing: boolean };

export function useAdminDashboardViewModel(days: StatsRange) {
  const setFilters = useUrlFilters();
  const { data, status, refetch, isPlaceholderData } = useAdminStats(days);

  let state: DashboardState;
  if (data) {
    state = {
      status: 'success',
      stats: data,
      rangeTotals: sumDaily(data.daily),
      isRefreshing: isPlaceholderData,
    };
  } else if (status === 'error') {
    state = { status: 'error', retry: () => void refetch() };
  } else {
    state = { status: 'pending' };
  }

  return {
    state,
    onDaysChange: (value: string) =>
      setFilters({ days: value === DEFAULT_STATS_RANGE ? undefined : value }),
  };
}
