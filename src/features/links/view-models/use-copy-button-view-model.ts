'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

const COPIED_FEEDBACK_MS = 2000;

export function useCopyButtonViewModel(value: string) {
  const t = useTranslations('links');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timeout = window.setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
    } catch {
      toast.error(t('copyFailed'));
    }
  }

  return { isCopied, copy };
}
