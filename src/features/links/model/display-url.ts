/** `https://short.link/aB3xY9z` → `short.link/aB3xY9z` — the scheme is noise in a list. */
export function toDisplayUrl(url: string) {
  return url.replace(/^https?:\/\//, '');
}

/** `<input type="datetime-local">` value (local time) → RFC 3339 in UTC, second precision. */
export function localDateTimeToRfc3339(value: string) {
  return new Date(value).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** A `datetime-local` value for "now", used as the picker's lower bound. */
export function nowAsLocalDateTime(now: Date) {
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}
