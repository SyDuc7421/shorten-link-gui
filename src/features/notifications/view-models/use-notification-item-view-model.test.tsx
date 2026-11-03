import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@/test/utils';

import { useMarkNotificationRead } from '../model/notifications-api';
import type { Notification } from '../model/types';
import { useNotificationItemViewModel } from './use-notification-item-view-model';

vi.mock('../model/notifications-api', () => ({ useMarkNotificationRead: vi.fn() }));

const unread: Notification = {
  id: '12',
  type: 'link_enabled',
  link_id: '1',
  code: 'abc',
  expires_at: null,
  read_at: null,
  created_at: '2026-11-03T00:00:00Z',
};
const mutate = vi.fn();

describe('useNotificationItemViewModel', () => {
  beforeEach(() => {
    mutate.mockReset();
    vi.mocked(useMarkNotificationRead).mockReturnValue({ mutate } as unknown as ReturnType<
      typeof useMarkNotificationRead
    >);
  });

  it('marks an unread notification read and tells the caller it is done', () => {
    const onDone = vi.fn();
    const { result } = renderHook(() => useNotificationItemViewModel(unread, onDone));
    expect(result.current.isUnread).toBe(true);
    result.current.onSelect();
    expect(mutate).toHaveBeenCalledWith('12');
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('does not call the API for one that is already read', () => {
    const onDone = vi.fn();
    const read = { ...unread, read_at: '2026-11-03T01:00:00Z' };
    const { result } = renderHook(() => useNotificationItemViewModel(read, onDone));
    expect(result.current.isUnread).toBe(false);
    result.current.onSelect();
    expect(mutate).not.toHaveBeenCalled();
    expect(onDone).toHaveBeenCalledOnce();
  });
});
