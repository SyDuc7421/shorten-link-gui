'use client';

import { hasStatus } from '../model/admin-errors';
import { useAdminMe } from '../model/me-api';
import type { AdminUserDetail } from '../model/types';
import { useAdminUser, useSetUserDisabled } from '../model/users-api';

export type UserDetailState =
  | { status: 'pending' }
  | { status: 'notFound' }
  | { status: 'error'; retry: () => void }
  | {
      status: 'success';
      user: AdminUserDetail;
      /** The API refuses self-disable (409); the view hides the action instead. */
      isSelf: boolean;
      isDisabled: boolean;
      toggleDisabled: (reason: string | null) => Promise<AdminUserDetail>;
    };

export function useUserDetailViewModel(id: string) {
  const query = useAdminUser(id);
  const me = useAdminMe();
  const setDisabled = useSetUserDisabled();

  let state: UserDetailState;
  if (query.status === 'pending') {
    state = { status: 'pending' };
  } else if (query.status === 'error') {
    state = hasStatus(query.error, 404)
      ? { status: 'notFound' }
      : { status: 'error', retry: () => void query.refetch() };
  } else {
    const user = query.data;
    const isDisabled = user.disabled_at !== null;
    state = {
      status: 'success',
      user,
      isSelf: me.data?.id === user.id,
      isDisabled,
      toggleDisabled: (reason) =>
        setDisabled.mutateAsync({ id: user.id, isDisabled: !isDisabled, reason }),
    };
  }

  return { state };
}
