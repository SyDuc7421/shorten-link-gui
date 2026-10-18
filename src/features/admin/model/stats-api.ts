import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { authedHttp } from '@/features/auth';

import { adminKeys } from './query-keys';
import { adminStatsSchema, type StatsRange } from './types';

export function useAdminStats(days: StatsRange) {
  return useQuery({
    queryKey: adminKeys.stats(days),
    queryFn: async () =>
      adminStatsSchema.parse(await authedHttp<unknown>(`/api/admin/stats?days=${days}`)),
    // Switching the range keeps the old numbers, dimmed, instead of a skeleton.
    placeholderData: keepPreviousData,
  });
}
