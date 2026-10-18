import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { AdminDashboard, statsFiltersSchema } from '@/features/admin';
import { initLocale } from '@/i18n/locale';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: 'admin.dashboard' });
  return { title: t('title') };
}

export default async function AdminDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await initLocale(params);
  const { days } = statsFiltersSchema.parse(await searchParams);

  return <AdminDashboard days={days} />;
}
