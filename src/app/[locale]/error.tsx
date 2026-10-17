'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');
  const tCommon = useTranslations('common');

  useEffect(() => {
    // Replace with your reporter (Sentry, OTel, ...).
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold">{t('pageTitle')}</h1>
      <p className="text-muted-foreground">{t('pageDescription')}</p>
      <button
        onClick={reset}
        className="mx-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {tCommon('retry')}
      </button>
    </main>
  );
}
