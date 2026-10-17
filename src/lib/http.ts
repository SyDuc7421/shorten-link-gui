import { env } from '@/lib/env';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
    message?: string,
  ) {
    super(message ?? `Request failed with status ${status}`);
    this.name = 'HttpError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

/**
 * Thin fetch wrapper. Keep it transport-only: no auth rules, no endpoints,
 * no business logic. Feature code owns its own endpoints and schemas.
 */
export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...rest,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new HttpError(response.status, payload);
  }

  return payload as T;
}
