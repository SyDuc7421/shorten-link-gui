import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import { authedHttp } from '@/features/auth';
import { HttpError } from '@/lib/http';

import { linkPageSchema, shortenedLinkSchema, type LinkPage, type ShortenInput } from '../types';

const linksKey = ['links'] as const;

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
    mutationFn: async ({ url, expiresAt }: ShortenInput) =>
      shortenedLinkSchema.parse(
        await authedHttp<unknown>('/api/links', {
          method: 'POST',
          body: { url, expires_at: expiresAt },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: linksKey }),
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
