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
  return { title: t('signInTitle') };
}

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  await initLocale(params);

  return <AuthForm mode="signIn" />;
}
