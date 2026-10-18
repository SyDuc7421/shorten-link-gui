import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import { authedHttp } from '@/features/auth';

import { hasStatus } from './admin-errors';
import { withQuery, withReason } from './admin-http';
import { adminKeys, invalidateAdminData } from './query-keys';
import {
  adminLinkSchema,
  linkPageSchema,
  type AdminLink,
  type LinkPage,
  type LinkQuery,
} from './types';

function linkPath(code: string) {
  return `/api/admin/links/${encodeURIComponent(code)}`;
}

export function useAdminLinks(query: LinkQuery) {
  return useInfiniteQuery({
    queryKey: adminKeys.linkList(query),
    queryFn: async ({ pageParam }) =>
      linkPageSchema.parse(
        await authedHttp<unknown>(
          withQuery('/api/admin/links', {
            q: query.q,
            status: query.status,
            user_id: query.userId,
            cursor: pageParam,
          }),
        ),
      ),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
    placeholderData: keepPreviousData,
  });
}

function mapLinks(
  data: InfiniteData<LinkPage> | undefined,
  map: (links: AdminLink[]) => AdminLink[],
) {
  if (!data) return data;
  return { ...data, pages: data.pages.map((page) => ({ ...page, links: map(page.links) })) };
}

export function useSetLinkDisabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      isDisabled,
      reason,
    }: {
      code: string;
      isDisabled: boolean;
      reason: string | null;
    }) =>
      adminLinkSchema.parse(
        await authedHttp<unknown>(`${linkPath(code)}/${isDisabled ? 'disable' : 'enable'}`, {
          method: 'POST',
          body: withReason(reason),
        }),
      ),
    onSuccess: (link) => {
      queryClient.setQueriesData<InfiniteData<LinkPage>>(
        { queryKey: adminKeys.linkLists() },
        (data) =>
          mapLinks(data, (links) => links.map((row) => (row.code === link.code ? link : row))),
      );
      // The row may now belong to another status filter; the lists refetch.
      void invalidateAdminData(queryClient);
    },
  });
}

export function useDeleteAdminLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, reason }: { code: string; reason: string | null }) => {
      try {
        await authedHttp<null>(linkPath(code), { method: 'DELETE', body: withReason(reason) });
      } catch (error) {
        // Already gone is the outcome the admin asked for.
        if (!hasStatus(error, 404)) throw error;
      }
    },
    onSuccess: (_data, { code }) => {
      queryClient.setQueriesData<InfiniteData<LinkPage>>(
        { queryKey: adminKeys.linkLists() },
        (data) => mapLinks(data, (links) => links.filter((row) => row.code !== code)),
      );
      void invalidateAdminData(queryClient);
    },
  });
}
