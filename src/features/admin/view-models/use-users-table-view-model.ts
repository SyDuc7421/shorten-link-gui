'use client';

import { useAdminUsers } from '../model/users-api';
import type { UserFilters } from '../model/types';
import { toPagedListState } from './paged-list-state';
import { useListToolbarViewModel } from './use-list-toolbar-view-model';

export function useUsersTableViewModel(filters: UserFilters) {
  return {
    toolbar: useListToolbarViewModel(filters),
    state: toPagedListState(useAdminUsers(filters), (page) => page.users),
  };
}
