import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { AdminUserDetail, idSchema, linkFiltersSchema } from '@/features/admin';
import { initLocale } from '@/i18n/locale';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: 'admin.users' });
  return { title: t('title') };
}

export default async function AdminUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await initLocale(params);
  // Kept as a string end to end — a snowflake does not survive Number().
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const linkFilters = linkFiltersSchema.parse(await searchParams);

  return <AdminUserDetail id={id.data} linkFilters={linkFilters} />;
}
