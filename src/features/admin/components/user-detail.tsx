'use client';

import { ArrowLeft, Ban, CircleCheck, UserX } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';

import type { AdminUserDetail as AdminUserDetailData, LinkFilters } from '../model/types';
import { useUserDetailViewModel } from '../view-models/use-user-detail-view-model';
import { ConfirmActionDialog } from './confirm-action-dialog';
import { AdminLinksTable } from './links-table';
import { QuotaForm } from './quota-form';
import { UserStatusBadge } from './status-badge';

interface AdminUserDetailProps {
  id: string;
  /** `?q=&status=` for this user's link list. */
  linkFilters: LinkFilters;
}

export function AdminUserDetail({ id, linkFilters }: AdminUserDetailProps) {
  const t = useTranslations('admin.users');
  const { state } = useUserDetailViewModel(id);

  if (state.status === 'pending') return <UserDetailSkeleton />;

  if (state.status === 'notFound') {
    return (
      <EmptyState
        icon={<UserX className="size-5" aria-hidden="true" />}
        title={t('notFoundTitle')}
        description={t('notFoundDescription')}
        action={
          <Button asChild variant="outline" className="h-11 md:h-9">
            <Link href="/admin/users">{t('backToUsers')}</Link>
          </Button>
        }
      />
    );
  }

  if (state.status === 'error') return <ErrorState onRetry={state.retry} />;

  const { user, isSelf, isDisabled, toggleDisabled } = state;
  const action = isDisabled
    ? {
        label: t('enable'),
        icon: <CircleCheck aria-hidden="true" />,
        title: t('enableTitle', { email: user.email }),
        description: t('enableDescription'),
        successMessage: t('enabled'),
      }
    : {
        label: t('disable'),
        icon: <Ban aria-hidden="true" />,
        title: t('disableTitle', { email: user.email }),
        description: t('disableDescription'),
        successMessage: t('disabled'),
      };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/users"
          className="flex min-h-11 w-fit items-center gap-1 rounded-md text-sm text-muted-foreground hover:text-foreground md:min-h-9"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('backToUsers')}
        </Link>
        <PageHeader
          title={user.email}
          className="pb-0"
          actions={
            isSelf ? null : (
              <ConfirmActionDialog
                trigger={
                  <Button
                    type="button"
                    variant={isDisabled ? 'outline' : 'destructive'}
                    className="h-11 md:h-9"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                }
                title={action.title}
                description={action.description}
                confirmLabel={action.label}
                isDestructive={!isDisabled}
                hasReason={!isDisabled}
                successMessage={action.successMessage}
                onConfirm={toggleDisabled}
              />
            )
          }
        />
        {isSelf ? <p className="text-sm text-muted-foreground">{t('selfNotice')}</p> : null}
      </div>

      <UserFacts user={user} />
      <QuotaForm key={user.quota_daily} user={user} />
      <AdminLinksTable heading={t('linksHeading')} query={{ ...linkFilters, userId: user.id }} />
    </div>
  );
}

function UserFacts({ user }: { user: AdminUserDetailData }) {
  const t = useTranslations('admin.users');
  const tRole = useTranslations('admin.role');
  const format = useFormatter();

  return (
    <dl
      aria-label={t('facts')}
      className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-4 sm:grid-cols-3 lg:grid-cols-6"
    >
      <Fact label={t('columns.status')}>
        <UserStatusBadge disabledAt={user.disabled_at} />
      </Fact>
      <Fact label={t('columns.role')}>{tRole(user.role)}</Fact>
      <Fact label={t('columns.created')}>
        {format.dateTime(new Date(user.created_at), { dateStyle: 'medium' })}
      </Fact>
      <Fact label={t('columns.links')}>{format.number(user.link_count)}</Fact>
      <Fact label={t('linksToday')}>
        {t('linksTodayValue', { count: user.links_today, quota: user.quota_daily })}
      </Fact>
      <Fact label={t('totalClicks')}>{format.number(user.total_clicks)}</Fact>
    </dl>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{children}</dd>
    </div>
  );
}

function UserDetailSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-72 max-w-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-64 w-full max-w-2xl rounded-xl" />
    </div>
  );
}
