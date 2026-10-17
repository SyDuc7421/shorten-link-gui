'use client';

import { useState } from 'react';

import { useDeleteLink } from '../model/links-api';
import type { Link } from '../model/types';

export function useDeleteLinkViewModel(link: Link, onDeleted: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const mutation = useDeleteLink();

  function onOpenChange(open: boolean) {
    // Closing mid-request would hide the outcome.
    if (mutation.isPending) return;
    if (!open) mutation.reset();
    setIsOpen(open);
  }

  function confirm() {
    mutation.mutate(link.code, {
      onSuccess: () => {
        setIsOpen(false);
        onDeleted();
      },
    });
  }

  return {
    isOpen,
    isPending: mutation.isPending,
    isError: mutation.isError,
    onOpenChange,
    confirm,
  };
}
