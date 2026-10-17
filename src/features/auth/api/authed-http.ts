import { http, HttpError } from '@/lib/http';

import { useSessionStore } from '../store';
import { tokenPairSchema } from '../types';

type AuthedRequestOptions = Parameters<typeof http>[1];

let refreshInFlight: Promise<boolean> | null = null;

async function exchangeRefreshToken(): Promise<boolean> {
  const { refreshToken, setTokens, signOut } = useSessionStore.getState();
  if (!refreshToken) return false;

  try {
    const pair = tokenPairSchema.parse(
      await http<unknown>('/api/auth/refresh', {
        method: 'POST',
        body: { refresh_token: refreshToken },
      }),
    );
    setTokens(pair);
    return true;
  } catch (error) {
    // A rejected token is final; a network blip is not worth logging out over.
    if (error instanceof HttpError && error.status === 401) signOut();
    return false;
  }
}

/**
 * Refresh tokens are single-use on the server, so concurrent 401s must share
 * one exchange instead of racing and invalidating each other.
 */
function refreshSession(): Promise<boolean> {
  refreshInFlight ??= exchangeRefreshToken().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

function withBearer(options: AuthedRequestOptions, token: string | null): AuthedRequestOptions {
  return {
    ...options,
    headers: { ...options?.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  };
}

/** `http` with the session's bearer token, retrying once after a token refresh. */
export async function authedHttp<T>(path: string, options: AuthedRequestOptions = {}): Promise<T> {
  try {
    return await http<T>(path, withBearer(options, useSessionStore.getState().accessToken));
  } catch (error) {
    if (!(error instanceof HttpError) || error.status !== 401) throw error;
    if (!(await refreshSession())) throw error;
    return http<T>(path, withBearer(options, useSessionStore.getState().accessToken));
  }
}
