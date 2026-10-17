import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    // Required in next-intl v4. Omitting it causes "Unable to find next-intl locale".
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
