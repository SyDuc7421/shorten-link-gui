import type en from './messages/en.json';
import type { routing } from './src/i18n/routing';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    /** Autocomplete and compile-time checks for every t() key. */
    Messages: typeof en;
  }
}
