import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth';
import { renderHook } from '@/test/utils';

import { useNotifications } from '../model/notifications-api';
import { useNotificationBellViewModel } from './use-notification-bell-view-model';

vi.mock('@/features/auth', () => ({ useSession: vi.fn() }));
vi.mock('../model/notifications-api', () => ({ useNotifications: vi.fn() }));

function mock(session: 'loading' | 'signedIn' | 'signedOut', data: unknown) {
  vi.mocked(useSession).mockReturnValue({
    status: session,
    email: null,
    signOut: vi.fn(),
  } as ReturnType<typeof useSession>);
  vi.mocked(useNotifications).mockReturnValue({ data } as unknown as ReturnType<
    typeof useNotifications
  >);
}

describe('useNotificationBellViewModel', () => {
  beforeEach(() => {
    vi.mocked(useSession).mockReset();
    vi.mocked(useNotifications).mockReset();
  });

  it.each(['loading', 'signedOut'] as const)('is hidden while %s', (session) => {
    mock(session, undefined);
    expect(renderHook(() => useNotificationBellViewModel()).result.current).toEqual({
      status: 'hidden',
    });
  });

  it('reads the unread count from the first page, not the loaded items', () => {
    const item = { id: '1', read_at: null };
    mock('signedIn', {
      pages: [
        { items: [item, item], unread_count: 150 },
        { items: [item], unread_count: 149 },
      ],
    });
    const state = renderHook(() => useNotificationBellViewModel()).result.current;
    if (state.status !== 'visible') throw new Error(`unexpected ${state.status}`);
    expect(state.unreadCount).toBe(150);
    expect(state.badge).toEqual({ value: 99, hasOverflow: true });
  });

  it('has no badge before data arrives', () => {
    mock('signedIn', undefined);
    const state = renderHook(() => useNotificationBellViewModel()).result.current;
    if (state.status !== 'visible') throw new Error(`unexpected ${state.status}`);
    expect(state.unreadCount).toBe(0);
    expect(state.badge).toBeNull();
  });

  it('opens and closes the popover', () => {
    mock('signedIn', undefined);
    const { result } = renderHook(() => useNotificationBellViewModel());
    const open = () => {
      if (result.current.status !== 'visible') throw new Error('hidden');
      return result.current;
    };
    act(() => open().onOpenChange(true));
    expect(open().isOpen).toBe(true);
    act(() => open().close());
    expect(open().isOpen).toBe(false);
  });
});
