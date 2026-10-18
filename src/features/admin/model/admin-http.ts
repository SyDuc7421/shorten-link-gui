/** Appends the non-empty params, so an unset filter never reaches the API. */
export function withQuery(path: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

/** The optional audit-log reason every admin write accepts. */
export function withReason(reason: string | null) {
  return reason ? { reason } : {};
}
