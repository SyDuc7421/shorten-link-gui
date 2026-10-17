import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '@/lib/http';

import { useSessionStore } from './session-store';
import { authedHttp } from './authed-http';

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('authedHttp', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    useSessionStore.setState({ accessToken: 'old', refreshToken: 'r1', email: 'a@b.co' });
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('refreshes once for concurrent 401s and retries with the new token', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith('/api/auth/refresh')) {
        return jsonResponse(200, { access_token: 'new', refresh_token: 'r2' });
      }
      const auth = new Headers(init?.headers).get('Authorization');
      return auth === 'Bearer new' ? jsonResponse(200, { ok: true }) : jsonResponse(401, {});
    });

    const results = await Promise.all([authedHttp('/api/links'), authedHttp('/api/links')]);

    expect(results).toEqual([{ ok: true }, { ok: true }]);
    const refreshCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).endsWith('/api/auth/refresh'),
    );
    expect(refreshCalls).toHaveLength(1);
    expect(useSessionStore.getState().refreshToken).toBe('r2');
  });

  it('signs out when the refresh token is rejected', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(401, { error: 'unauthorized' }));

    await expect(authedHttp('/api/links')).rejects.toBeInstanceOf(HttpError);
    expect(useSessionStore.getState().refreshToken).toBeNull();
  });

  it('keeps the session when the refresh fails on the network', async () => {
    fetchMock.mockImplementation(async (input) => {
      if (String(input).endsWith('/api/auth/refresh')) throw new TypeError('Failed to fetch');
      return jsonResponse(401, {});
    });

    await expect(authedHttp('/api/links')).rejects.toBeInstanceOf(HttpError);
    expect(useSessionStore.getState().refreshToken).toBe('r1');
  });
});
