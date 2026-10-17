import { beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@/test/utils';

import { useDeleteLink } from '../model/links-api';
import type { Link } from '../model/types';
import { useDeleteLinkViewModel } from './use-delete-link-view-model';

vi.mock('../model/links-api', () => ({ useDeleteLink: vi.fn() }));

const link: Link = {
  code: 'abc',
  short_url: 'https://short.link/abc',
  original_url: 'https://example.com',
  clicks: 0,
  expires_at: null,
  created_at: '2026-10-01T00:00:00Z',
};

const mutation = { mutate: vi.fn(), reset: vi.fn(), isPending: false, isError: false };

function mockMutation(overrides: Partial<typeof mutation> = {}) {
  vi.mocked(useDeleteLink).mockReturnValue({ ...mutation, ...overrides } as unknown as ReturnType<
    typeof useDeleteLink
  >);
}

describe('useDeleteLinkViewModel', () => {
  beforeEach(() => mockMutation());

  it('closes and hands focus back after the delete lands', () => {
    const onDeleted = vi.fn();
    mutation.mutate.mockImplementation((_code: string, options: { onSuccess: () => void }) =>
      options.onSuccess(),
    );
    const { result } = renderHook(() => useDeleteLinkViewModel(link, onDeleted));

    act(() => result.current.onOpenChange(true));
    act(() => result.current.confirm());

    expect(mutation.mutate.mock.calls[0]?.[0]).toBe('abc');
    expect(result.current.isOpen).toBe(false);
    expect(onDeleted).toHaveBeenCalledOnce();
  });

  it('stays open while the request is in flight', () => {
    const { result, rerender } = renderHook(() => useDeleteLinkViewModel(link, vi.fn()));
    act(() => result.current.onOpenChange(true));

    mockMutation({ isPending: true });
    rerender();
    act(() => result.current.onOpenChange(false));

    expect(result.current.isOpen).toBe(true);
  });

  it('clears a previous error when closed', () => {
    const { result } = renderHook(() => useDeleteLinkViewModel(link, vi.fn()));
    act(() => result.current.onOpenChange(true));
    act(() => result.current.onOpenChange(false));
    expect(mutation.reset).toHaveBeenCalledOnce();
  });
});
