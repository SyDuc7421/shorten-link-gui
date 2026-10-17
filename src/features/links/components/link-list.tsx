'use client';

import { useRef } from 'react';
import { Clock, CornerDownRight, Link2, Loader2, MousePointerClick } from 'lucide-react';
import { useFormatter, useNow, useTranslations } from 'next-intl';

import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useLinks } from '../api/links-api';
import { toDisplayUrl } from '../lib/display-url';
import type { Link } from '../types';
import { CopyButton } from './copy-button';
import { DeleteLinkDialog } from './delete-link-dialog';

const SKELETON_ROWS = ['a', 'b', 'c'];

export function LinkList() {
  const t = useTranslations('links');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { data, status, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching } =
    useLinks();

  const links = data?.pages.flatMap((page) => page.links) ?? [];

  let body: React.ReactNode;
  if (status === 'pending') {
    body = <LinkListSkeleton />;
  } else if (status === 'error') {
    body = (
      <ErrorState
        title={t('loadErrorTitle')}
        description={t('loadErrorDescription')}
        onRetry={() => void refetch()}
      />
    );
  } else if (links.length === 0) {
    body = (
      <EmptyState
        icon={<Link2 className="size-5" aria-hidden="true" />}
        title={t('emptyTitle')}
        description={t('emptyDescription')}
      />
    );
  } else {
    body = (
      <div className="flex flex-col gap-4">
        <ul
          aria-labelledby="links-heading"
          className={cn(
            'flex flex-col gap-3 transition-opacity duration-(--duration-base)',
            isRefetching && !isFetchingNextPage && 'opacity-60',
          )}
        >
          {links.map((link) => (
            <LinkRow key={link.code} link={link} onDeleted={() => headingRef.current?.focus()} />
          ))}
        </ul>
        {hasNextPage ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 self-center md:h-9"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {t('loadMore')}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <section aria-labelledby="links-heading" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2
          id="links-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-semibold outline-none"
        >
          {t('listTitle')}
        </h2>
        {status === 'success' && links.length > 0 ? (
          <Badge variant="secondary" className="tabular-nums" aria-live="polite">
            {hasNextPage
              ? t('listCountMore', { count: links.length })
              : t('listCount', { count: links.length })}
          </Badge>
        ) : null}
      </div>
      {body}
    </section>
  );
}

function LinkRow({ link, onDeleted }: { link: Link; onDeleted: () => void }) {
  const t = useTranslations('links');
  const format = useFormatter();
  const now = useNow();
  const expiresAt = link.expires_at ? new Date(link.expires_at) : null;
  const isExpired = expiresAt !== null && expiresAt <= now;

  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-[border-color,box-shadow] duration-(--duration-fast) hover:border-primary/30 hover:shadow-md lg:flex-row lg:items-center lg:gap-6">
      <div className="flex min-w-0 flex-1 items-start gap-3 lg:items-center">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg ring-1',
            isExpired
              ? 'bg-muted text-muted-foreground ring-border'
              : 'bg-secondary text-secondary-foreground ring-primary/10',
          )}
        >
          <Link2 className="size-5" aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <a
            href={link.short_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'truncate font-mono text-base font-semibold underline-offset-4 hover:underline',
              isExpired ? 'text-muted-foreground line-through' : 'text-primary',
            )}
          >
            {toDisplayUrl(link.short_url)}
          </a>
          <p
            className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground"
            title={link.original_url}
          >
            <CornerDownRight className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{link.original_url}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground lg:shrink-0">
        <span className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-medium text-foreground tabular-nums">
          <MousePointerClick className="size-4 text-muted-foreground" aria-hidden="true" />
          {t('clicks', { count: link.clicks })}
        </span>
        <span className="tabular-nums">
          {t('created', {
            date: format.dateTime(new Date(link.created_at), { dateStyle: 'medium' }),
          })}
        </span>
        {expiresAt ? (
          <Badge variant={isExpired ? 'outline' : 'secondary'} className="gap-1">
            <Clock aria-hidden="true" />
            {isExpired
              ? t('expired')
              : t('expires', { date: format.dateTime(expiresAt, { dateStyle: 'medium' }) })}
          </Badge>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-t border-border pt-3 sm:justify-end lg:border-0 lg:pt-0">
        <CopyButton value={link.short_url} appearance="compact" className="flex-1 sm:flex-none" />
        <DeleteLinkDialog link={link} onDeleted={onDeleted} />
      </div>
    </li>
  );
}

export function LinkListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {SKELETON_ROWS.map((key) => (
        <div
          key={key}
          className="flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row lg:items-center lg:gap-6"
        >
          <div className="flex flex-1 items-start gap-3 lg:items-center">
            <Skeleton className="size-10 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-48 max-w-full" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          </div>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-11 w-full lg:h-9 lg:w-20" />
        </div>
      ))}
    </div>
  );
}
