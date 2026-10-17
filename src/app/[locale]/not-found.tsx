import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('errors');
  const tCommon = useTranslations('common');

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold">{t('notFoundTitle')}</h1>
      <p className="text-muted-foreground">{t('notFoundDescription')}</p>
      <Link href="/" className="underline underline-offset-4">
        {tCommon('back')}
      </Link>
    </main>
  );
}
