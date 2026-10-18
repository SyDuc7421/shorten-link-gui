'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { toAdminFailure, type AdminFailure } from '../model/admin-errors';
import { isReasonWithinMax } from '../model/types';

interface ConfirmActionOptions {
  /** Runs the request. A rejection keeps the dialog open and shows why. */
  onConfirm: (reason: string | null) => Promise<unknown>;
  /** Toasted once the request lands. */
  successMessage: string;
  /** After success — e.g. move focus off a row that is about to disappear. */
  onDone?: () => void;
}

export function useConfirmActionViewModel({
  onConfirm,
  successMessage,
  onDone,
}: ConfirmActionOptions) {
  const t = useTranslations('admin.errors');
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [failure, setFailure] = useState<AdminFailure | null>(null);

  function onOpenChange(open: boolean) {
    // Closing mid-request would hide the outcome.
    if (isPending) return;
    if (!open) {
      setReason('');
      setFailure(null);
    }
    setIsOpen(open);
  }

  async function run() {
    const trimmed = reason.trim();
    if (!isReasonWithinMax(trimmed)) {
      setFailure('reasonTooLong');
      return;
    }

    setFailure(null);
    setIsPending(true);
    try {
      await onConfirm(trimmed || null);
      setIsOpen(false);
      setReason('');
      toast.success(successMessage);
      onDone?.();
    } catch (error) {
      setFailure(toAdminFailure(error));
    } finally {
      setIsPending(false);
    }
  }

  return {
    isOpen,
    onOpenChange,
    reason,
    onReasonChange: setReason,
    isPending,
    errorMessage: failure ? t(failure) : null,
    confirm: () => void run(),
  };
}
