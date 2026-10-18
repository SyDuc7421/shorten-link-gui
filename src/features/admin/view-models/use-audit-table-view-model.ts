'use client';

import { useAuditLog } from '../model/audit-api';
import {
  getAuditDetails,
  isKnownAuditAction,
  type AuditAction,
  type AuditDetails,
} from '../model/audit';
import type { AuditEntry, AuditFilters } from '../model/types';
import { toPagedListState } from './paged-list-state';
import { ALL_OPTION } from './use-list-toolbar-view-model';
import { useUrlFilters } from './use-url-filters';

export interface AuditRow {
  entry: AuditEntry;
  /** `null` for an action this GUI has no label for — the view shows it raw. */
  action: AuditAction | null;
  details: AuditDetails;
}

export function useAuditTableViewModel(filters: AuditFilters) {
  const setFilters = useUrlFilters();
  const state = toPagedListState(useAuditLog(filters), (page) =>
    page.entries.map((entry): AuditRow => ({
      entry,
      action: isKnownAuditAction(entry.action) ? entry.action : null,
      details: getAuditDetails(entry.metadata),
    })),
  );

  return {
    state,
    resourceType: filters.resource_type ?? ALL_OPTION,
    onResourceTypeChange: (value: string) =>
      setFilters({ resource_type: value === ALL_OPTION ? undefined : value }),
    isActorFiltered: filters.actor_id !== undefined,
    clearActor: () => setFilters({ actor_id: undefined }),
    hasFilters: filters.resource_type !== undefined || filters.actor_id !== undefined,
    clearFilters: () => setFilters({ resource_type: undefined, actor_id: undefined }),
  };
}
