'use client';

import { Ban, CircleCheck, Link2, Trash2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

import { EmptyState } from '@/components/common/empty-state';
import { Button } from '@/components/ui/button';
import { TableRow } from '@/components/ui/table';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { LINK_STATUSES, type AdminLink, type LinkQuery } from '../model/types';
import { useLinkActionsViewModel } from '../view-models/use-link-actions-view-model';
import { useLinksTableViewModel } from '../view-models/use-links-table-view-model';
import { ConfirmActionDialog } from './confirm-action-dialog';
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
import { LinkStatusBadge } from './status-badge';

interface AdminLinksTableProps {
  heading: string;
  query: LinkQuery;
}

export function AdminLinksTable({ heading, query }: AdminLinksTableProps) {
  const t = useTranslations('admin.links');
  const tStatus = useTranslations('admin.status');
  const format = useFormatter();
  const { toolbar, state, headingRef, focusHeading } = useLinksTableViewModel(query);

  const columns = [
    t('columns.link'),
    t('columns.owner'),
    t('columns.clicks'),
    t('columns.created'),
    t('columns.status'),
    t('columns.actions'),
  ];

  const empty = toolbar.hasFilters ? (
    <FilteredEmptyState query={query.q} onClear={toolbar.clearFilters} />
  ) : (
    <EmptyState
      icon={<Link2 className="size-5" aria-hidden="true" />}
      title={t('emptyTitle')}
      description={t('emptyDescription')}
    />
  );

  return (
    <PagedListSection
      heading={heading}
      headingRef={headingRef}
      toolbar={
        <ListToolbar
          toolbar={toolbar}
          searchLabel={t('searchLabel')}
          statuses={LINK_STATUSES.map((value) => ({ value, label: tStatus(value) }))}
        />
      }
      state={state}
      columns={columns}
      empty={empty}
    >
      {(rows) => (
        <StackedTable>
          <StackedTableHeader>
            <TableRow>
              <StackedTableHead>{t('columns.link')}</StackedTableHead>
              <StackedTableHead>{t('columns.owner')}</StackedTableHead>
              <StackedTableHead isNumeric>{t('columns.clicks')}</StackedTableHead>
              <StackedTableHead>{t('columns.created')}</StackedTableHead>
              <StackedTableHead>{t('columns.status')}</StackedTableHead>
              <StackedTableHead isNumeric>
                <span className="sr-only">{t('columns.actions')}</span>
              </StackedTableHead>
            </TableRow>
          </StackedTableHeader>
          <StackedTableBody>
            {rows.map(({ link, status }) => (
              <StackedTableRow key={link.id}>
                <StackedTableCell>
                  <div className="flex min-w-0 flex-col gap-1 md:max-w-xs">
                    <a
                      href={link.short_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-mono font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      {link.code}
                    </a>
                    <span
                      className="truncate text-sm text-muted-foreground"
                      title={link.original_url}
                    >
                      {link.original_url}
                    </span>
                  </div>
                </StackedTableCell>
                <StackedTableCell label={t('columns.owner')}>
                  <Link
                    href={`/admin/users/${link.owner.id}`}
                    className="block min-w-0 truncate underline-offset-4 hover:underline md:max-w-48"
                  >
                    {link.owner.email}
                  </Link>
                </StackedTableCell>
                <StackedTableCell label={t('columns.clicks')} isNumeric className="tabular-nums">
                  {format.number(link.clicks)}
                </StackedTableCell>
                <StackedTableCell label={t('columns.created')} className="tabular-nums">
                  {format.dateTime(new Date(link.created_at), { dateStyle: 'medium' })}
                </StackedTableCell>
                <StackedTableCell label={t('columns.status')}>
                  <LinkStatusBadge status={status} />
                </StackedTableCell>
                <StackedTableCell className="border-t pt-3 md:border-0 md:pt-2">
                  <LinkRowActions link={link} onDeleted={focusHeading} />
                </StackedTableCell>
              </StackedTableRow>
            ))}
          </StackedTableBody>
        </StackedTable>
      )}
    </PagedListSection>
  );
}

const ROW_BUTTON = 'h-11 flex-1 sm:flex-none lg:size-9 lg:px-0';

/** ≤2 row actions → icon buttons with tooltips; labels stay visible below lg (DESIGN.md §14, §21). */
function LinkRowActions({ link, onDeleted }: { link: AdminLink; onDeleted: () => void }) {
  const t = useTranslations('admin.links');
  const { isDisabled, toggleDisabled, remove } = useLinkActionsViewModel(link);

  const toggle = isDisabled
    ? {
        label: t('enable'),
        icon: <CircleCheck aria-hidden="true" />,
        title: t('enableTitle', { code: link.code }),
        description: t('enableDescription'),
        confirmLabel: t('enableConfirm'),
        successMessage: t('enabled'),
      }
    : {
        label: t('disable'),
        icon: <Ban aria-hidden="true" />,
        title: t('disableTitle', { code: link.code }),
        description: t('disableDescription'),
        confirmLabel: t('disableConfirm'),
        successMessage: t('disabled'),
      };

  return (
    <div className="flex w-full items-center gap-2 sm:justify-end">
      <ConfirmActionDialog
        tooltip={toggle.label}
        trigger={
          <Button type="button" variant="ghost" className={ROW_BUTTON}>
            {toggle.icon}
            <span className="lg:sr-only">{toggle.label}</span>
          </Button>
        }
        title={toggle.title}
        description={toggle.description}
        confirmLabel={toggle.confirmLabel}
        isDestructive={!isDisabled}
        hasReason={!isDisabled}
        successMessage={toggle.successMessage}
        onConfirm={toggleDisabled}
      />
      <ConfirmActionDialog
        tooltip={t('delete')}
        trigger={
          <Button
            type="button"
            variant="ghost"
            className={cn(
              ROW_BUTTON,
              'text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive/20 dark:hover:bg-destructive/20',
            )}
          >
            <Trash2 aria-hidden="true" />
            <span className="lg:sr-only">{t('delete')}</span>
          </Button>
        }
        title={t('deleteTitle', { code: link.code })}
        description={t('deleteDescription')}
        confirmLabel={t('deleteConfirm')}
        isDestructive
        hasReason
        successMessage={t('deleted')}
        onConfirm={remove}
        onDone={onDeleted}
      />
    </div>
  );
}
