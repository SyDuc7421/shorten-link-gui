import { nowAsLocalDateTime } from './display-url';

/** A picked day with no time yet lands on the end of that day. */
export const DEFAULT_EXPIRY_TIME = '23:59';

/** `Date` → `YYYY-MM-DD` in local time. */
function toLocalDate(date: Date) {
  return nowAsLocalDateTime(date).slice(0, 10);
}

/** Splits a `datetime-local` value (`YYYY-MM-DDTHH:mm`, or `''`) into its parts. */
export function splitLocalDateTime(value: string) {
  return { date: value.slice(0, 10), time: value.slice(11, 16) };
}

/** Local midnight of a `YYYY-MM-DD` day, or of the day `now` falls on. */
export function startOfLocalDay(day: string | Date) {
  return new Date(`${typeof day === 'string' ? day : toLocalDate(day)}T00:00`);
}

/** Replaces the day, keeping the time (or the default when there is none). */
export function withDate(value: string, date: Date) {
  return `${toLocalDate(date)}T${splitLocalDateTime(value).time || DEFAULT_EXPIRY_TIME}`;
}

/** Replaces the time, keeping the day (or `today` when there is none). */
export function withTime(value: string, time: string, today: Date) {
  return `${splitLocalDateTime(value).date || toLocalDate(today)}T${time}`;
}

/** Expiry of a stored link relative to `now`. */
export function getExpiryState(expiresAt: string | null, now: Date) {
  const date = expiresAt ? new Date(expiresAt) : null;
  return { expiresAt: date, isExpired: date !== null && date <= now };
}
