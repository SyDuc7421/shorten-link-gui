import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import { authedHttp } from '@/features/auth';

import { hasStatus } from './admin-errors';
import { withQuery, withReason } from './admin-http';
import { adminKeys, invalidateAdminData } from './query-keys';
import {
  adminUserDetailSchema,
  userPageSchema,
  type AdminUserDetail,
  type UserFilters,
  type UserPage,
} from './types';

function userPath(id: string) {
  return `/api/admin/users/${encodeURIComponent(id)}`;
}

export function useAdminUsers(filters: UserFilters) {
  return useInfiniteQuery({
    queryKey: adminKeys.userList(filters),
    queryFn: async ({ pageParam }) =>
      userPageSchema.parse(
        await authedHttp<unknown>(
          withQuery('/api/admin/users', {
            q: filters.q,
            status: filters.status,
            cursor: pageParam,
          }),
        ),
      ),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
    // A new search keeps the old rows on screen, dimmed, until the answer lands.
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: async () => adminUserDetailSchema.parse(await authedHttp<unknown>(userPath(id))),
    // An unknown user is an answer, not a blip.
    retry: (failureCount, error) => !hasStatus(error, 404) && failureCount < 1,
  });
}

function replaceUser(data: InfiniteData<UserPage> | undefined, user: AdminUserDetail) {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      users: page.users.map((row) => (row.id === user.id ? { ...row, ...user } : row)),
    })),
  };
}

/** Show the server's row at once, then let everything it affects refetch. */
function useApplyUser() {
  const queryClient = useQueryClient();

  return (user: AdminUserDetail) => {
    queryClient.setQueryData(adminKeys.user(user.id), user);
    queryClient.setQueriesData<InfiniteData<UserPage>>(
      { queryKey: adminKeys.userLists() },
      (data) => replaceUser(data, user),
    );
    void invalidateAdminData(queryClient);
  };
}

export function useUpdateUserQuota() {
  const applyUser = useApplyUser();

  return useMutation({
    mutationFn: async ({
      id,
      quotaDaily,
      reason,
    }: {
      id: string;
      quotaDaily: number;
      reason: string | null;
    }) =>
      adminUserDetailSchema.parse(
        await authedHttp<unknown>(userPath(id), {
          method: 'PATCH',
          body: { quota_daily: quotaDaily, ...withReason(reason) },
        }),
      ),
    onSuccess: applyUser,
  });
}

export function useSetUserDisabled() {
  const applyUser = useApplyUser();

  return useMutation({
    mutationFn: async ({
      id,
      isDisabled,
      reason,
    }: {
      id: string;
      isDisabled: boolean;
      reason: string | null;
    }) =>
      adminUserDetailSchema.parse(
        await authedHttp<unknown>(`${userPath(id)}/${isDisabled ? 'disable' : 'enable'}`, {
          method: 'POST',
          body: withReason(reason),
        }),
      ),
    onSuccess: applyUser,
  });
}
