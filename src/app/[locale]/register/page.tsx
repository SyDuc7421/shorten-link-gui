import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { AuthForm } from '@/features/auth';
import { initLocale } from '@/i18n/locale';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('registerTitle') };
}

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  await initLocale(params);

  return (
    <main id="main" className="relative isolate flex w-full flex-1 flex-col">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-glow" />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-12 sm:py-24">
        <AuthForm mode="register" />
      </div>
    </main>
  );
}
