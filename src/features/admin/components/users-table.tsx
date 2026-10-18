'use client';

import { Shield, Users } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { TableRow } from '@/components/ui/table';
import { Link } from '@/i18n/navigation';

import { USER_STATUSES, type UserFilters } from '../model/types';
import { useUsersTableViewModel } from '../view-models/use-users-table-view-model';
import { ListToolbar } from './list-toolbar';
import { FilteredEmptyState, PagedListSection } from './paged-list-section';
import {
  StackedTable,
  StackedTableBody,
  StackedTableCell,
  StackedTableHead,
  StackedTableHeader,
  StackedTableRow,
} from './stacked-table';
import { UserStatusBadge } from './status-badge';

export function AdminUsersTable({ filters }: { filters: UserFilters }) {
  const t = useTranslations('admin.users');
  const tStatus = useTranslations('admin.status');
  const tRole = useTranslations('admin.role');
  const format = useFormatter();
  const { toolbar, state } = useUsersTableViewModel(filters);

  const columns = [
    t('columns.email'),
    t('columns.role'),
    t('columns.links'),
    t('columns.quota'),
    t('columns.created'),
    t('columns.status'),
  ];

  const empty = toolbar.hasFilters ? (
    <FilteredEmptyState query={filters.q} onClear={toolbar.clearFilters} />
  ) : (
    <EmptyState
      icon={<Users className="size-5" aria-hidden="true" />}
      title={t('emptyTitle')}
      description={t('emptyDescription')}
    />
  );

  return (
    <PagedListSection
      heading={t('heading')}
      toolbar={
        <ListToolbar
          toolbar={toolbar}
          searchLabel={t('searchLabel')}
          statuses={USER_STATUSES.map((value) => ({ value, label: tStatus(value) }))}
        />
      }
      state={state}
      columns={columns}
      empty={empty}
    >
      {(users) => (
        <StackedTable>
          <StackedTableHeader>
            <TableRow>
              <StackedTableHead>{t('columns.email')}</StackedTableHead>
              <StackedTableHead>{t('columns.role')}</StackedTableHead>
              <StackedTableHead isNumeric>{t('columns.links')}</StackedTableHead>
              <StackedTableHead isNumeric>{t('columns.quota')}</StackedTableHead>
              <StackedTableHead>{t('columns.created')}</StackedTableHead>
              <StackedTableHead>{t('columns.status')}</StackedTableHead>
            </TableRow>
          </StackedTableHeader>
          <StackedTableBody>
            {users.map((user) => (
              <StackedTableRow key={user.id}>
                <StackedTableCell>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="block min-w-0 truncate font-medium text-primary underline-offset-4 hover:underline md:max-w-64"
                  >
                    {user.email}
                  </Link>
                </StackedTableCell>
                <StackedTableCell label={t('columns.role')}>
                  {user.role === 'admin' ? (
                    <Badge variant="outline" className="gap-1">
                      <Shield aria-hidden="true" />
                      {tRole('admin')}
                    </Badge>
                  ) : (
                    tRole('user')
                  )}
                </StackedTableCell>
                <StackedTableCell label={t('columns.links')} isNumeric className="tabular-nums">
                  {format.number(user.link_count)}
                </StackedTableCell>
                <StackedTableCell label={t('columns.quota')} isNumeric className="tabular-nums">
                  {format.number(user.quota_daily)}
                </StackedTableCell>
                <StackedTableCell label={t('columns.created')} className="tabular-nums">
                  {format.dateTime(new Date(user.created_at), { dateStyle: 'medium' })}
                </StackedTableCell>
                <StackedTableCell label={t('columns.status')}>
                  <UserStatusBadge disabledAt={user.disabled_at} />
                </StackedTableCell>
              </StackedTableRow>
            ))}
          </StackedTableBody>
        </StackedTable>
      )}
    </PagedListSection>
  );
}
