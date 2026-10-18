import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@/test/utils';

import { useDeleteAdminLink, useSetLinkDisabled } from '../model/links-api';
import type { AdminLink } from '../model/types';
import { useLinkActionsViewModel } from './use-link-actions-view-model';

vi.mock('../model/links-api', () => ({
  useSetLinkDisabled: vi.fn(),
  useDeleteAdminLink: vi.fn(),
}));

const link: AdminLink = {
  id: '7311234567890123458',
  code: 'abc',
  short_url: 'https://s.test/abc',
  original_url: 'https://example.com',
  clicks: 3,
  owner: { id: '7311234567890123457', email: 'owner@example.com', disabled_at: null },
  disabled_at: null,
  expires_at: null,
  created_at: '2026-10-01T00:00:00Z',
};

const setDisabled = vi.fn();
const remove = vi.fn();

describe('useLinkActionsViewModel', () => {
  beforeEach(() => {
    vi.mocked(useSetLinkDisabled).mockReturnValue({
      mutateAsync: setDisabled,
    } as unknown as ReturnType<typeof useSetLinkDisabled>);
    vi.mocked(useDeleteAdminLink).mockReturnValue({
      mutateAsync: remove,
    } as unknown as ReturnType<typeof useDeleteAdminLink>);
  });

  it('disables an active link', () => {
    const { result } = renderHook(() => useLinkActionsViewModel(link));
    expect(result.current.isDisabled).toBe(false);
    void result.current.toggleDisabled('phish');
    expect(setDisabled).toHaveBeenCalledWith({ code: 'abc', isDisabled: true, reason: 'phish' });
  });

  it('enables a disabled link', () => {
    const { result } = renderHook(() =>
      useLinkActionsViewModel({ ...link, disabled_at: '2026-10-18T10:00:00Z' }),
    );
    expect(result.current.isDisabled).toBe(true);
    void result.current.toggleDisabled(null);
    expect(setDisabled).toHaveBeenCalledWith({ code: 'abc', isDisabled: false, reason: null });
  });

  it('deletes by code with the reason', () => {
    const { result } = renderHook(() => useLinkActionsViewModel(link));
    void result.current.remove('spam');
    expect(remove).toHaveBeenCalledWith({ code: 'abc', reason: 'spam' });
  });
});
