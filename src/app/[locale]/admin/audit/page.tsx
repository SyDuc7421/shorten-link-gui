import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/common/page-header';
import { AdminAuditTable, auditFiltersSchema } from '@/features/admin';
import { initLocale } from '@/i18n/locale';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: 'admin.audit' });
  return { title: t('title') };
}

export default async function AdminAuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: 'admin.audit' });
  const filters = auditFiltersSchema.parse(await searchParams);

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} className="pb-0" />
      <AdminAuditTable filters={filters} />
    </>
  );
}
