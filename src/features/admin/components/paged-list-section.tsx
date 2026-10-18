'use client';

import { useId } from 'react';
import { Loader2, SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { PagedListState } from '../view-models/paged-list-state';
import { StackedTableSkeleton } from './stacked-table';

interface PagedListSectionProps<T> {
  heading: string;
  /** Lets a row action move focus here once its row is gone. */
  headingRef?: React.Ref<HTMLHeadingElement>;
  toolbar?: React.ReactNode;
  state: PagedListState<T>;
  /** Column labels — the skeleton mirrors them. */
  columns: readonly string[];
  empty: React.ReactNode;
  children: (items: T[]) => React.ReactNode;
}

export function PagedListSection<T>({
  heading,
  headingRef,
  toolbar,
  state,
  columns,
  empty,
  children,
}: PagedListSectionProps<T>) {
  const t = useTranslations('admin.list');
  const headingId = useId();

  let body: React.ReactNode;
  if (state.status === 'pending') {
    body = <StackedTableSkeleton columns={columns} />;
  } else if (state.status === 'error') {
    body = (
      <ErrorState
        title={t('loadErrorTitle')}
        description={t('loadErrorDescription')}
        onRetry={state.retry}
      />
    );
  } else if (state.status === 'empty') {
    body = empty;
  } else {
    body = (
      <div className="flex flex-col gap-4">
        <div
          aria-busy={state.isRefreshing}
          className={cn(
            'transition-opacity duration-(--duration-base)',
            state.isRefreshing && 'opacity-60',
          )}
        >
          {children(state.items)}
        </div>
        {state.hasNextPage ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 self-center md:h-9"
            disabled={state.isFetchingNextPage}
            onClick={state.loadMore}
          >
            {state.isFetchingNextPage ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : null}
            {t('loadMore')}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-semibold outline-none"
        >
          {heading}
        </h2>
        {state.status === 'success' ? (
          <Badge variant="secondary" className="tabular-nums" aria-live="polite">
            {state.hasNextPage
              ? t('countMore', { count: state.items.length })
              : t('count', { count: state.items.length })}
          </Badge>
        ) : null}
      </div>
      {toolbar}
      {body}
    </section>
  );
}

interface FilteredEmptyStateProps {
  /** The search text, or `''` when only a select filter is set. */
  query: string;
  onClear: () => void;
}

/** DESIGN.md §13 "no search results" / "filtered to nothing". */
export function FilteredEmptyState({ query, onClear }: FilteredEmptyStateProps) {
  const t = useTranslations('table');
  const title = query ? t('noResultsTitle', { query }) : t('noMatchTitle');

  return (
    <EmptyState
      icon={<SearchX className="size-5" aria-hidden="true" />}
      title={title}
      description={t('noResultsDescription')}
      action={
        <Button type="button" variant="outline" className="h-11 md:h-9" onClick={onClear}>
          {t('clearFilters')}
        </Button>
      }
    />
  );
}
