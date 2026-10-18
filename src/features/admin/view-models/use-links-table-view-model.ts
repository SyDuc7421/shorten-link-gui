'use client';

import { useRef } from 'react';

import { getAdminLinkStatus, type AdminLinkStatus } from '../model/link-status';
import { useAdminLinks } from '../model/links-api';
import type { AdminLink, LinkQuery } from '../model/types';
import { toPagedListState } from './paged-list-state';
import { useListToolbarViewModel } from './use-list-toolbar-view-model';

export interface AdminLinkRow {
  link: AdminLink;
  status: AdminLinkStatus;
}

export function useLinksTableViewModel(query: LinkQuery) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const toolbar = useListToolbarViewModel(query);
  const now = new Date();
  const state = toPagedListState(useAdminLinks(query), (page) =>
    page.links.map((link): AdminLinkRow => ({ link, status: getAdminLinkStatus(link, now) })),
  );

  return {
    toolbar,
    state,
    headingRef,
    /** After a row is deleted, focus moves to something that still exists. */
    focusHeading: () => headingRef.current?.focus(),
  };
}
