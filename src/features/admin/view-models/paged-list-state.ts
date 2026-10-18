import type { InfiniteData } from '@tanstack/react-query';

export type PagedListState<T> =
  | { status: 'pending' }
  | { status: 'error'; retry: () => void }
  | { status: 'empty' }
  | {
      status: 'success';
      items: T[];
      hasNextPage: boolean;
      isFetchingNextPage: boolean;
      /** A background refetch or a new filter, not a next page — the view dims the rows. */
      isRefreshing: boolean;
      loadMore: () => void;
    };

interface PagedQuery<Page> {
  data: InfiniteData<Page> | undefined;
  status: 'pending' | 'error' | 'success';
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
  refetch: () => unknown;
  fetchNextPage: () => unknown;
}

/** One cursor-paged list (users, links, audit) as the four states its view renders. */
export function toPagedListState<Page, T>(
  query: PagedQuery<Page>,
  select: (page: Page) => T[],
): PagedListState<T> {
  if (query.status === 'pending') return { status: 'pending' };
  // A failed background refetch keeps the rows that are already on screen.
  if (!query.data) return { status: 'error', retry: () => void query.refetch() };

  const items = query.data.pages.flatMap(select);
  if (items.length === 0) return { status: 'empty' };

  return {
    status: 'success',
    items,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
  };
}
