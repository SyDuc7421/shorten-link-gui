import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { routing, type Locale } from './routing';

/**
 * Narrows the `[locale]` route param and enables static rendering for it.
 * Call once at the top of every page and layout under `[locale]`.
 */
export async function initLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}
