'use client';

import { useTranslations } from 'next-intl';

import type { CommonAuthReason } from '../model/auth-errors';

/** One translation for the failures every auth form shares. */
export function useAuthErrorMessage() {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');

  return (reason: CommonAuthReason) =>
    reason === 'tooManyAttempts' ? t('tooManyAttempts') : tErrors(reason);
}
