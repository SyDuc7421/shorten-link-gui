import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import messages from '@messages/en.json';
import { routing } from '@/i18n/routing';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

/** Use this instead of Testing Library's render — components need the intl provider. */
export function render(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { render as renderWithoutProviders } from '@testing-library/react';
