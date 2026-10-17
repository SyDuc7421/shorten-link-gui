import { Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { siteConfig } from '@/config/site';
import { SiteHeader } from '@/components/layout/site-header';
import { initLocale } from '@/i18n/locale';
import { routing } from '@/i18n/routing';
import { AppProviders } from '@/providers/app-providers';

import '../globals.css';

const fontSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' });
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

/** Pre-render every locale at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: 'common' });

  return {
    title: { default: t('appName'), template: `%s · ${t('appName')}` },
    description: siteConfig.description,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1017' },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Required for static rendering — without it the page opts into dynamic.
  const locale = await initLocale(params);

  const t = await getTranslations('nav');

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable}`}>
        <a
          href="#main"
          className="sr-only bg-background focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2"
        >
          {t('skipToContent')}
        </a>
        {/* v4 inherits messages and formats from i18n/request.ts — no props needed. */}
        <NextIntlClientProvider>
          <AppProviders>
            <div className="flex min-h-dvh flex-col">
              <SiteHeader />
              {children}
            </div>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
