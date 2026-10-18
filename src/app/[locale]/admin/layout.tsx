import type { Metadata } from 'next';

import { AdminGate, AdminSidebar } from '@/features/admin';
import { initLocale } from '@/i18n/locale';

export const metadata: Metadata = { robots: { index: false } };

/** Admin shell. The gate hides the whole area, nav included, from non-admins. */
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await initLocale(params);

  return (
    <main id="main" className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 md:px-6">
      <AdminGate>
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
        </div>
      </AdminGate>
    </main>
  );
}
