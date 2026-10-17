import { initLocale } from '@/i18n/locale';

/** Shared shell for the sign-in, registration and password-reset screens. */
export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await initLocale(params);

  return (
    <main id="main" className="relative isolate flex w-full flex-1 flex-col">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-glow" />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-12 sm:py-24">
        {children}
      </div>
    </main>
  );
}
