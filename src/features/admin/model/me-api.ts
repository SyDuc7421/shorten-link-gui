'use client';

import { useQuery } from '@tanstack/react-query';

import { authedHttp, useSession } from '@/features/auth';

import { adminKeys } from './query-keys';
import { adminMeSchema } from './types';

/**
 * 200 for an enabled admin, 403 for anyone else. Not retried: a 403 is the
 * answer, and the gate offers its own retry for a network error. The session
 * clears the whole query cache on sign-out, so the answer never leaks to the
 * next account.
 */
export function useAdminMe() {
  const { status } = useSession();

  return useQuery({
    queryKey: adminKeys.me(),
    queryFn: async () => adminMeSchema.parse(await authedHttp<unknown>('/api/admin/me')),
    enabled: status === 'signedIn',
    retry: false,
    staleTime: 5 * 60_000,
  });
}
