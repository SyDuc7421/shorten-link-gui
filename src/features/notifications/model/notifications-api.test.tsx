import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authedHttp, useSession } from '@/features/auth';
import { HttpError } from '@/lib/http';

import { useMarkNotificationRead, useNotifications } from './notifications-api';

vi.mock('@/features/auth', () => ({ authedHttp: vi.fn(), useSession: vi.fn() }));

function mockSession(status: 'loading' | 'signedIn' | 'signedOut', email: string | null) {
  vi.mocked(useSession).mockReturnValue({
    status,
    email,
    signOut: vi.fn(),
  } as ReturnType<typeof useSession>);
}

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { queryClient, wrapper };
}

const emptyPage = { items: [], next_cursor: '', unread_count: 0 };

describe('useNotifications', () => {
  beforeEach(() => {
    vi.mocked(authedHttp).mockReset();
    vi.mocked(useSession).mockReset();
  });

  it('makes no request while signed out', () => {
    mockSession('signedOut', null);
    const { wrapper } = setup();
    renderHook(() => useNotifications(), { wrapper });
    expect(authedHttp).not.toHaveBeenCalled();
  });

  it('requests again for a different account instead of reusing the cache', async () => {
    vi.mocked(authedHttp).mockResolvedValue(emptyPage);
    mockSession('signedIn', 'a@x.com');
    const { wrapper } = setup();
    const { result, rerender } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authedHttp).toHaveBeenCalledTimes(1);

    mockSession('signedIn', 'b@x.com');
    rerender();
    await waitFor(() => expect(authedHttp).toHaveBeenCalledTimes(2));
  });
});

describe('useMarkNotificationRead', () => {
  beforeEach(() => vi.mocked(authedHttp).mockReset());

  it('posts to the notification read route', async () => {
    vi.mocked(authedHttp).mockResolvedValue(null);
    const { wrapper } = setup();
    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper });
    await act(() => result.current.mutateAsync('12'));
    expect(authedHttp).toHaveBeenCalledWith('/api/notifications/12/read', { method: 'POST' });
  });

  it('treats 404 as already handled', async () => {
    vi.mocked(authedHttp).mockRejectedValueOnce(new HttpError(404, null));
    const { wrapper } = setup();
    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper });
    await act(() => result.current.mutateAsync('12'));
    expect(result.current.isError).toBe(false);
  });

  it('fails on a server error', async () => {
    vi.mocked(authedHttp).mockRejectedValueOnce(new HttpError(500, null));
    const { wrapper } = setup();
    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper });
    await expect(act(() => result.current.mutateAsync('12'))).rejects.toBeInstanceOf(HttpError);
  });

  it('calls onError even after the component that started it unmounted', async () => {
    vi.mocked(authedHttp).mockRejectedValueOnce(new HttpError(500, null));
    const onError = vi.fn();
    const { wrapper } = setup();
    const { result, unmount } = renderHook(() => useMarkNotificationRead({ onError }), {
      wrapper,
    });
    act(() => result.current.mutate('12'));
    unmount();
    await waitFor(() => expect(onError).toHaveBeenCalledOnce());
  });
});
