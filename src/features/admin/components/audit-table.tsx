'use client';

import { useId } from 'react';
import { ScrollText, X } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableRow } from '@/components/ui/table';
import { Link } from '@/i18n/navigation';

import type { AuditAction } from '../model/audit';
import type { AuditFilters } from '../model/types';
import { useAuditTableViewModel, type AuditRow } from '../view-models/use-audit-table-view-model';
import { ALL_OPTION } from '../view-models/use-list-toolbar-view-model';
import { FilteredEmptyState, PagedListSection } from './paged-list-section';
import {
  StackedTable,
  StackedTableBody,
  StackedTableCell,
  StackedTableHead,
  StackedTableHeader,
  StackedTableRow,
} from './stacked-table';

const ACTION_LABELS = {
  'user.disable': 'actions.userDisable',
  'user.enable': 'actions.userEnable',
  'user.quota': 'actions.userQuota',
  'link.disable': 'actions.linkDisable',
  'link.enable': 'actions.linkEnable',
  'link.delete': 'actions.linkDelete',
  'admin.grant': 'actions.adminGrant',
  'admin.revoke': 'actions.adminRevoke',
} as const satisfies Record<AuditAction, string>;

export function AdminAuditTable({ filters }: { filters: AuditFilters }) {
  const t = useTranslations('admin.audit');
  const format = useFormatter();
  const typeId = useId();
  const vm = useAuditTableViewModel(filters);

  const columns = [
    t('columns.time'),
    t('columns.actor'),
    t('columns.action'),
    t('columns.target'),
    t('columns.details'),
  ];

  const toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-2 sm:w-48">
        <Label htmlFor={typeId}>{t('typeLabel')}</Label>
        <Select value={vm.resourceType} onValueChange={vm.onResourceTypeChange}>
          <SelectTrigger
            id={typeId}
            className="w-full data-[size=default]:h-11 md:data-[size=default]:h-9"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION}>{t('allTypes')}</SelectItem>
            <SelectItem value="user">{t('typeUser')}</SelectItem>
            <SelectItem value="link">{t('typeLink')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {vm.isActorFiltered ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{t('actorFiltered')}</Badge>
          <Button type="button" variant="ghost" className="h-11 md:h-9" onClick={vm.clearActor}>
            <X aria-hidden="true" />
            {t('clearActor')}
          </Button>
        </div>
      ) : null}
    </div>
  );

  const empty = vm.hasFilters ? (
    <FilteredEmptyState query="" onClear={vm.clearFilters} />
  ) : (
    <EmptyState
      icon={<ScrollText className="size-5" aria-hidden="true" />}
      title={t('emptyTitle')}
      description={t('emptyDescription')}
    />
  );

  return (
    <PagedListSection
      heading={t('heading')}
      toolbar={toolbar}
      state={vm.state}
      columns={columns}
      empty={empty}
    >
      {(rows) => (
        <StackedTable>
          <StackedTableHeader>
            <TableRow>
              {columns.map((column) => (
                <StackedTableHead key={column}>{column}</StackedTableHead>
              ))}
            </TableRow>
          </StackedTableHeader>
          <StackedTableBody>
            {rows.map((row) => (
              <StackedTableRow key={row.entry.id}>
                <StackedTableCell className="font-medium tabular-nums">
                  {format.dateTime(new Date(row.entry.created_at), {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </StackedTableCell>
                <StackedTableCell label={t('columns.actor')}>
                  {row.entry.actor ? (
                    <Link
                      href={`/admin/audit?actor_id=${row.entry.actor.id}`}
                      className="block min-w-0 truncate underline-offset-4 hover:underline md:max-w-48"
                    >
                      {row.entry.actor.email}
                    </Link>
                  ) : (
                    t('system')
                  )}
                </StackedTableCell>
                <StackedTableCell label={t('columns.action')}>
                  {row.action ? t(ACTION_LABELS[row.action]) : row.entry.action}
                </StackedTableCell>
                <StackedTableCell label={t('columns.target')}>
                  <AuditTarget row={row} />
                </StackedTableCell>
                <StackedTableCell label={t('columns.details')}>
                  <AuditDetailsText row={row} />
                </StackedTableCell>
              </StackedTableRow>
            ))}
          </StackedTableBody>
        </StackedTable>
      )}
    </PagedListSection>
  );
}

function AuditTarget({ row }: { row: AuditRow }) {
  const t = useTranslations('admin.audit');
  const { entry, details } = row;

  if (entry.resource_type === 'user') {
    return (
      <Link
        href={`/admin/users/${entry.resource_id}`}
        className="underline-offset-4 hover:underline"
      >
        {t('viewUser')}
      </Link>
    );
  }
  // A deleted link has no row left; its code is all that remains.
  const code = details.code ?? entry.resource_id;
  return (
    <Link
      href={`/admin/links?q=${encodeURIComponent(code)}`}
      className="font-mono underline-offset-4 hover:underline"
    >
      {code}
    </Link>
  );
}

function AuditDetailsText({ row }: { row: AuditRow }) {
  const t = useTranslations('admin.audit');
  const { before, after, reason } = row.details;
  const parts: string[] = [];
  if (before !== undefined && after !== undefined) parts.push(t('quotaChange', { before, after }));
  if (reason) parts.push(t('reason', { reason }));

  return (
    <span className="min-w-0 text-sm break-words text-muted-foreground">
      {parts.length > 0 ? parts.join(' · ') : t('noDetails')}
    </span>
  );
}
