'use client';

import { useDeleteAdminLink, useSetLinkDisabled } from '../model/links-api';
import type { AdminLink } from '../model/types';

export function useLinkActionsViewModel(link: AdminLink) {
  const setDisabled = useSetLinkDisabled();
  const deleteLink = useDeleteAdminLink();
  const isDisabled = link.disabled_at !== null;

  return {
    isDisabled,
    toggleDisabled: (reason: string | null) =>
      setDisabled.mutateAsync({ code: link.code, isDisabled: !isDisabled, reason }),
    remove: (reason: string | null) => deleteLink.mutateAsync({ code: link.code, reason }),
  };
}
