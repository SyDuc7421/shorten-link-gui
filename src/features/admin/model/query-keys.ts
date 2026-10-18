import type { QueryClient } from '@tanstack/react-query';

import type { AuditFilters, LinkQuery, StatsRange, UserFilters } from './types';

export const adminKeys = {
  all: ['admin'] as const,
  me: () => [...adminKeys.all, 'me'] as const,
  userLists: () => [...adminKeys.all, 'users', 'list'] as const,
  userList: (filters: UserFilters) => [...adminKeys.userLists(), filters] as const,
  user: (id: string) => [...adminKeys.all, 'users', 'detail', id] as const,
  linkLists: () => [...adminKeys.all, 'links'] as const,
  linkList: (query: LinkQuery) => [...adminKeys.linkLists(), query] as const,
  auditList: (filters: AuditFilters) => [...adminKeys.all, 'audit', filters] as const,
  stats: (days: StatsRange) => [...adminKeys.all, 'stats', days] as const,
};

/**
 * One admin write can change any list, count, chart or audit page — refetch
 * what is on screen, mark the rest stale. Who the admin is does not change.
 */
export function invalidateAdminData(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: adminKeys.all,
    predicate: (query) => query.queryKey[1] !== 'me',
  });
}
