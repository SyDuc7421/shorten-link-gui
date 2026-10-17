import { defineRouting } from 'next-intl/routing';

/**
 * Single source of truth for locales. Adding a language means: add the code
 * here, add `messages/<code>.json`, done. Nothing else in the app changes.
 */
export const routing = defineRouting({
  locales: ['en'],
  defaultLocale: 'en',
  // 'as-needed' keeps the default locale unprefixed (/about, not /en/about).
  // Switch to 'always' once you ship a second locale — it is better for SEO
  // and makes hreflang straightforward.
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
