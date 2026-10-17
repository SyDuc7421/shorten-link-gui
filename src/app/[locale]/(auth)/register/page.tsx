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

  return <AuthForm mode="register" />;
}
