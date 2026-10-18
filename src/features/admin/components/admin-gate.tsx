'use client';

import { ShieldX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ErrorState } from '@/components/common/error-state';
import { PermissionState } from '@/components/common/permission-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';

import { useAdminGateViewModel } from '../view-models/use-admin-gate-view-model';

/** Renders the admin area for an enabled admin, and nothing of it for anyone else. */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin.gate');
  const state = useAdminGateViewModel();

  if (state.status === 'pending') return <AdminGateSkeleton />;

  if (state.status === 'forbidden') {
    return (
      <PermissionState
        reason="noPermission"
        icon={<ShieldX className="size-6" aria-hidden="true" />}
        title={t('forbiddenTitle')}
        description={t('forbiddenDescription')}
        action={
          <Button asChild variant="outline" className="h-11 md:h-9">
            <Link href="/">{t('backHome')}</Link>
          </Button>
        }
      />
    );
  }

  if (state.status === 'error') {
    return (
      <ErrorState
        title={t('errorTitle')}
        description={t('errorDescription')}
        onRetry={state.retry}
      />
    );
  }

  return children;
}

function AdminGateSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6 lg:flex-row lg:gap-10">
      <Skeleton className="h-11 w-full lg:h-40 lg:w-52" />
      <div className="flex flex-1 flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
