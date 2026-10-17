import { SessionGate } from '@/features/auth';
import { Landing } from '@/features/landing';
import { LinksDashboard, LinksDashboardSkeleton } from '@/features/links';
import { initLocale } from '@/i18n/locale';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  await initLocale(params);

  return (
    <SessionGate
      signedIn={<LinksDashboard />}
      signedOut={<Landing />}
      fallback={<LinksDashboardSkeleton />}
    />
  );
}
