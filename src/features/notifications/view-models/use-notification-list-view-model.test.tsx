import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@/test/utils';

import { useMarkAllNotificationsRead, useNotifications } from '../model/notifications-api';
import type { Notification } from '../model/types';
import { useNotificationListViewModel } from './use-notification-list-view-model';

vi.mock('../model/notifications-api', () => ({
  useNotifications: vi.fn(),
  useMarkAllNotificationsRead: vi.fn(),
}));

const item: Notification = {
  id: '2',
  type: 'link_disabled',
  link_id: '1',
  code: 'abc',
  expires_at: null,
  read_at: null,
  created_at: '2026-11-03T00:00:00Z',
};

const base = {
  data: undefined,
  status: 'success',
  refetch: vi.fn(),
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  isRefetching: false,
};
const markAll = { mutate: vi.fn(), isPending: false };

function mock(overrides: Record<string, unknown>) {
  vi.mocked(useNotifications).mockReturnValue({ ...base, ...overrides } as unknown as ReturnType<
    typeof useNotifications
  >);
  vi.mocked(useMarkAllNotificationsRead).mockReturnValue(
    markAll as unknown as ReturnType<typeof useMarkAllNotificationsRead>,
  );
}

describe('useNotificationListViewModel', () => {
  beforeEach(() => {
    vi.mocked(useNotifications).mockReset();
    base.refetch.mockReset();
    markAll.mutate.mockReset();
  });

  it('is pending while the first page loads', () => {
    mock({ status: 'pending' });
    expect(renderHook(() => useNotificationListViewModel()).result.current.state).toEqual({
      status: 'pending',
    });
  });

  it('exposes retry when the first load fails', () => {
    mock({ status: 'error' });
    const { state } = renderHook(() => useNotificationListViewModel()).result.current;
    if (state.status !== 'error') throw new Error(`unexpected ${state.status}`);
    state.retry();
    expect(base.refetch).toHaveBeenCalledOnce();
  });

  it('keeps the list when a background poll fails', () => {
    mock({
      status: 'error',
      data: { pages: [{ items: [item], unread_count: 1 }] },
    });
    expect(renderHook(() => useNotificationListViewModel()).result.current.state.status).toBe(
      'success',
    );
  });

  it('is empty when the first page has no items', () => {
    mock({ data: { pages: [{ items: [], unread_count: 0 }] } });
    expect(renderHook(() => useNotificationListViewModel()).result.current.state.status).toBe(
      'empty',
    );
  });

  it('flattens pages in order and separates a refresh from a next-page fetch', () => {
    mock({
      data: {
        pages: [
          { items: [item], unread_count: 2 },
          { items: [{ ...item, id: '1' }], unread_count: 2 },
        ],
      },
      hasNextPage: true,
      isRefetching: true,
      isFetchingNextPage: true,
    });
    const { state, unreadCount } = renderHook(() => useNotificationListViewModel()).result.current;
    if (state.status !== 'success') throw new Error(`unexpected ${state.status}`);
    expect(state.items.map((entry) => entry.id)).toEqual(['2', '1']);
    expect(state.isRefreshing).toBe(false);
    expect(unreadCount).toBe(2);
    state.loadMore();
    expect(base.fetchNextPage).toHaveBeenCalledOnce();
  });

  it('marks everything read', () => {
    mock({ data: { pages: [{ items: [item], unread_count: 1 }] } });
    renderHook(() => useNotificationListViewModel()).result.current.markAllRead();
    expect(markAll.mutate).toHaveBeenCalledOnce();
  });
});
