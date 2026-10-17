import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { ResetPasswordForm } from '@/features/auth';
import { initLocale } from '@/i18n/locale';

const searchParamsSchema = z.object({ token: z.string().min(1).optional().catch(undefined) });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: 'auth' });
  // The URL carries a reset token; never send it to another origin in a Referer.
  return { title: t('resetTitle'), referrer: 'no-referrer', robots: { index: false } };
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await initLocale(params);
  const { token } = searchParamsSchema.parse(await searchParams);

  return <ResetPasswordForm token={token ?? null} />;
}
