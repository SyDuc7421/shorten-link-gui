import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import { authedHttp } from '@/features/auth';
import { HttpError } from '@/lib/http';

import {
  aliasAvailabilitySchema,
  linkPageSchema,
  shortenedLinkSchema,
  type LinkPage,
  type ShortenInput,
} from './types';

const linksKey = ['links'] as const;
const aliasKey = [...linksKey, 'alias'] as const;

export function useLinks() {
  return useInfiniteQuery({
    queryKey: linksKey,
    queryFn: async ({ pageParam }) => {
      const query = pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : '';
      return linkPageSchema.parse(await authedHttp<unknown>(`/api/links${query}`));
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
  });
}

export function useShortenLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, alias, expiresAt }: ShortenInput) =>
      shortenedLinkSchema.parse(
        await authedHttp<unknown>('/api/links', {
          method: 'POST',
          body: { url, expires_at: expiresAt, ...(alias ? { alias } : {}) },
        }),
      ),
    onSuccess: () => {
      // A cached "available" may now be wrong; drop it rather than refetch it.
      queryClient.removeQueries({ queryKey: aliasKey });
      return queryClient.invalidateQueries({ queryKey: linksKey, exact: true });
    },
  });
}

/**
 * Whether `alias` is free. Creating a link clears every cached answer.
 * The API limits this to 60/min per IP — callers debounce and only ask about
 * aliases that pass `getAliasProblem`.
 */
export function useAliasAvailability(alias: string, isEnabled: boolean) {
  return useQuery({
    queryKey: [...aliasKey, alias],
    queryFn: async () =>
      aliasAvailabilitySchema.parse(
        await authedHttp<unknown>(`/api/links/availability?alias=${encodeURIComponent(alias)}`),
      ),
    enabled: isEnabled,
    staleTime: 30_000,
    retry: false,
  });
}

function removeFromCache(data: InfiniteData<LinkPage> | undefined, code: string) {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      links: page.links.filter((link) => link.code !== code),
    })),
  };
}

export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      try {
        await authedHttp<null>(`/api/links/${encodeURIComponent(code)}`, { method: 'DELETE' });
      } catch (error) {
        // Already gone is the outcome the user asked for.
        if (!(error instanceof HttpError && error.status === 404)) throw error;
      }
    },
    onSuccess: (_data, code) =>
      queryClient.setQueryData<InfiniteData<LinkPage>>(linksKey, (data) =>
        removeFromCache(data, code),
      ),
  });
}
