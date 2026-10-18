import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { authedHttp } from '@/features/auth';

import { withQuery } from './admin-http';
import { adminKeys } from './query-keys';
import { auditPageSchema, type AuditFilters } from './types';

export function useAuditLog(filters: AuditFilters) {
  return useInfiniteQuery({
    queryKey: adminKeys.auditList(filters),
    queryFn: async ({ pageParam }) =>
      auditPageSchema.parse(
        await authedHttp<unknown>(
          withQuery('/api/admin/audit', {
            resource_type: filters.resource_type,
            actor_id: filters.actor_id,
            cursor: pageParam,
          }),
        ),
      ),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
    placeholderData: keepPreviousData,
  });
}
