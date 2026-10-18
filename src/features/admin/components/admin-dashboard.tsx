'use client';

import dynamic from 'next/dynamic';
import { MousePointerClick } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TableRow } from '@/components/ui/table';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { STATS_RANGES, type AdminStats, type StatsRange } from '../model/types';
import { useAdminDashboardViewModel } from '../view-models/use-admin-dashboard-view-model';
import {
  StackedTable,
  StackedTableBody,
  StackedTableCell,
  StackedTableHead,
  StackedTableHeader,
  StackedTableRow,
} from './stacked-table';

// recharts is large and only this screen needs it. The header imports the admin
// feature for its menu entry, so a static import would ship it on every page.
const DailyChart = dynamic(() => import('./daily-chart').then((module) => module.DailyChart), {
  ssr: false,
  loading: () => <Skeleton className="h-56 rounded-xl" />,
});

export function AdminDashboard({ days }: { days: StatsRange }) {
  const t = useTranslations('admin.dashboard');
  const format = useFormatter();
  const { state, onDaysChange } = useAdminDashboardViewModel(days);
  const dayCount = Number(days);

  let body: React.ReactNode;
  if (state.status === 'pending') {
    body = <DashboardSkeleton />;
  } else if (state.status === 'error') {
    body = (
      <ErrorState
        title={t('loadErrorTitle')}
        description={t('loadErrorDescription')}
        onRetry={state.retry}
      />
    );
  } else {
    const { stats, rangeTotals, isRefreshing } = state;
    body = (
      <div
        aria-busy={isRefreshing}
        className={cn(
          'flex flex-col gap-8 transition-opacity duration-(--duration-base)',
          isRefreshing && 'opacity-60',
        )}
      >
        <ul
          aria-label={t('totalsLabel')}
          className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
        >
          <StatTile
            label={t('users')}
            value={format.number(stats.totals.users)}
            delta={t('newInRange', { count: rangeTotals.new_users, days: dayCount })}
          />
          <StatTile
            label={t('links')}
            value={format.number(stats.totals.links)}
            delta={t('newInRange', { count: rangeTotals.new_links, days: dayCount })}
          />
          <StatTile
            label={t('clicks')}
            value={format.number(stats.totals.clicks)}
            delta={t('newInRange', { count: rangeTotals.clicks, days: dayCount })}
          />
          <StatTile label={t('disabledUsers')} value={format.number(stats.totals.disabled_users)} />
          <StatTile label={t('disabledLinks')} value={format.number(stats.totals.disabled_links)} />
        </ul>
        <section aria-label={t('chartsLabel')} className="grid gap-4 lg:grid-cols-3">
          <DailyChart
            title={t('newUsers')}
            total={format.number(rangeTotals.new_users)}
            data={stats.daily}
            metric="new_users"
            color="var(--chart-1)"
          />
          <DailyChart
            title={t('newLinks')}
            total={format.number(rangeTotals.new_links)}
            data={stats.daily}
            metric="new_links"
            color="var(--chart-2)"
          />
          <DailyChart
            title={t('clicks')}
            total={format.number(rangeTotals.clicks)}
            data={stats.daily}
            metric="clicks"
            color="var(--chart-3)"
          />
        </section>
        <TopLinks topLinks={stats.top_links} days={dayCount} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        className="pb-0"
        actions={
          <Select value={days} onValueChange={onDaysChange}>
            <SelectTrigger
              aria-label={t('rangeLabel')}
              className="w-40 data-[size=default]:h-11 md:data-[size=default]:h-9"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATS_RANGES.map((range) => (
                <SelectItem key={range} value={range}>
                  {t('range', { days: Number(range) })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      {body}
    </div>
  );
}

function StatTile({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <li className="flex min-w-0 flex-col gap-1 rounded-xl border bg-card p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      {delta ? <span className="text-xs text-muted-foreground">{delta}</span> : null}
    </li>
  );
}

function TopLinks({ topLinks, days }: { topLinks: AdminStats['top_links']; days: number }) {
  const t = useTranslations('admin.dashboard');
  const format = useFormatter();

  return (
    <section aria-labelledby="top-links-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="top-links-heading" className="text-lg font-semibold">
          {t('topLinks')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('topLinksDescription', { days })}</p>
      </div>
      {topLinks.length === 0 ? (
        <EmptyState
          icon={<MousePointerClick className="size-5" aria-hidden="true" />}
          title={t('noClicksTitle')}
          description={t('noClicksDescription')}
        />
      ) : (
        <StackedTable>
          <StackedTableHeader>
            <TableRow>
              <StackedTableHead>{t('code')}</StackedTableHead>
              <StackedTableHead isNumeric>{t('clicks')}</StackedTableHead>
            </TableRow>
          </StackedTableHeader>
          <StackedTableBody>
            {topLinks.map((link) => (
              <StackedTableRow key={link.code}>
                <StackedTableCell>
                  <Link
                    href={`/admin/links?q=${encodeURIComponent(link.code)}`}
                    className="font-mono font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {link.code}
                  </Link>
                </StackedTableCell>
                <StackedTableCell label={t('clicks')} isNumeric className="tabular-nums">
                  {format.number(link.clicks)}
                </StackedTableCell>
              </StackedTableRow>
            ))}
          </StackedTableBody>
        </StackedTable>
      )}
    </section>
  );
}

const SKELETON_TILES = ['users', 'links', 'clicks', 'disabledUsers', 'disabledLinks'];
const SKELETON_CHARTS = ['users', 'links', 'clicks'];

function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {SKELETON_TILES.map((key) => (
          <Skeleton key={key} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {SKELETON_CHARTS.map((key) => (
          <Skeleton key={key} className="h-56 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
