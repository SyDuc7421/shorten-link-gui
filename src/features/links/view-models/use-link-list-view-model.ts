'use client';

import { useRef } from 'react';

import { useLinks } from '../model/links-api';
import type { Link } from '../model/types';

export type LinkListState =
  | { status: 'pending' }
  | { status: 'error'; retry: () => void }
  | { status: 'empty' }
  | {
      status: 'success';
      links: Link[];
      hasNextPage: boolean;
      isFetchingNextPage: boolean;
      /** A background refetch, not a next page — the view dims the old rows. */
      isRefreshing: boolean;
      loadMore: () => void;
    };

export function useLinkListViewModel() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { data, status, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching } =
    useLinks();

  const links = data?.pages.flatMap((page) => page.links) ?? [];

  let state: LinkListState;
  if (status === 'pending') {
    state = { status: 'pending' };
  } else if (status === 'error') {
    state = { status: 'error', retry: () => void refetch() };
  } else if (links.length === 0) {
    state = { status: 'empty' };
  } else {
    state = {
      status: 'success',
      links,
      hasNextPage,
      isFetchingNextPage,
      isRefreshing: isRefetching && !isFetchingNextPage,
      loadMore: () => void fetchNextPage(),
    };
  }

  return {
    state,
    headingRef,
    /** After a row is deleted, focus moves to something that still exists. */
    focusHeading: () => headingRef.current?.focus(),
  };
}
