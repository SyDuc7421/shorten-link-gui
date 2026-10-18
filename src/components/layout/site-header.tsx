import { Link2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { AdminMenuItem } from '@/features/admin';
import { AccountMenu } from '@/features/auth';
import { Link } from '@/i18n/navigation';

export async function SiteHeader() {
  const t = await getTranslations('common');

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href="/"
          className="group flex min-h-11 items-center gap-2.5 rounded-md text-lg font-bold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20 transition-transform duration-(--duration-fast) group-hover:-rotate-6">
            <Link2 className="size-5" aria-hidden="true" />
          </span>
          {t('appName')}
        </Link>
        <AccountMenu items={<AdminMenuItem />} />
      </div>
    </header>
  );
}
