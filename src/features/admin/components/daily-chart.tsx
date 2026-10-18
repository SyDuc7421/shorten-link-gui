'use client';

import { useFormatter } from 'next-intl';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

import type { DailyStat } from '../model/types';

interface DailyChartProps {
  title: string;
  /** The range total, already formatted — the number the chart is about (DESIGN.md §5). */
  total: string;
  data: DailyStat[];
  metric: 'new_users' | 'new_links' | 'clicks';
  /** A chart token, e.g. `var(--chart-1)`. */
  color: string;
}

/**
 * One metric per chart: clicks run orders of magnitude above sign-ups, and
 * dual axes are not allowed (DESIGN.md §6 Chart).
 */
export function DailyChart({ title, total, data, metric, color }: DailyChartProps) {
  const format = useFormatter();
  const config = { [metric]: { label: title, color } } satisfies ChartConfig;
  // `date` is a UTC day; formatting it in local time could show the day before.
  const formatDay = (value: string) =>
    format.dateTime(new Date(value), { month: 'short', day: 'numeric', timeZone: 'UTC' });

  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <span className="text-lg font-semibold tabular-nums">{total}</span>
      </div>
      <ChartContainer config={config} className="aspect-auto h-40 w-full">
        <LineChart accessibilityLayer data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={formatDay}
          />
          <YAxis width={32} tickLine={false} axisLine={false} allowDecimals={false} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => (typeof value === 'string' ? formatDay(value) : value)}
              />
            }
          />
          <Line
            dataKey={metric}
            type="monotone"
            stroke={`var(--color-${metric})`}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </section>
  );
}
