import type { DailyStat } from './types';

export interface RangeTotals {
  new_users: number;
  new_links: number;
  clicks: number;
}

/** Totals for the selected range — the number shown beside each chart. */
export function sumDaily(daily: DailyStat[]): RangeTotals {
  return daily.reduce(
    (sum, day) => ({
      new_users: sum.new_users + day.new_users,
      new_links: sum.new_links + day.new_links,
      clicks: sum.clicks + day.clicks,
    }),
    { new_users: 0, new_links: 0, clicks: 0 },
  );
}
