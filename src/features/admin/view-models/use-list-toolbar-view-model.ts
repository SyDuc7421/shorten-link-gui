'use client';

import { useEffect, useState } from 'react';

import { useUrlFilters } from './use-url-filters';

/** Wait for a pause in typing before the URL — and so the query — changes. */
export const SEARCH_DELAY_MS = 300;
/** Select value for "no filter"; Radix Select cannot use an empty string. */
export const ALL_OPTION = 'all';

interface ListFilters {
  q: string;
  status?: string;
}

export function useListToolbarViewModel(filters: ListFilters) {
  const setFilters = useUrlFilters();
  const [search, setSearch] = useState(filters.q);
  /** The last search this box wrote to the URL. */
  const [requested, setRequested] = useState(filters.q);
  const [seenQuery, setSeenQuery] = useState(filters.q);

  // The URL changed. Our own debounced write coming back is not news — the
  // admin may have typed more since. Anything else (sidebar link, back
  // button) replaces what the box shows.
  if (filters.q !== seenQuery) {
    setSeenQuery(filters.q);
    if (filters.q !== requested) {
      setSearch(filters.q);
      setRequested(filters.q);
    }
  }

  useEffect(() => {
    const next = search.trim();
    if (next === filters.q) return;
    const timeout = window.setTimeout(() => {
      setRequested(next);
      setFilters({ q: next || undefined });
    }, SEARCH_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [search, filters.q, setFilters]);

  return {
    search,
    onSearchChange: setSearch,
    status: filters.status ?? ALL_OPTION,
    onStatusChange: (status: string) =>
      setFilters({ status: status === ALL_OPTION ? undefined : status }),
    hasFilters: filters.q !== '' || filters.status !== undefined,
    clearFilters: () => {
      setSearch('');
      setRequested('');
      setFilters({ q: undefined, status: undefined });
    },
  };
}

export type ListToolbarModel = ReturnType<typeof useListToolbarViewModel>;
