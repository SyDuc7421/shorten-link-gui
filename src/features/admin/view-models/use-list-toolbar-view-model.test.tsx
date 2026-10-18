import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@/test/utils';

import { SEARCH_DELAY_MS, useListToolbarViewModel } from './use-list-toolbar-view-model';
import { useUrlFilters } from './use-url-filters';

vi.mock('./use-url-filters', () => ({ useUrlFilters: vi.fn() }));

const setFilters = vi.fn();

describe('useListToolbarViewModel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useUrlFilters).mockReturnValue(setFilters);
  });
  afterEach(() => vi.useRealTimers());

  it('writes the search to the URL after a pause in typing', () => {
    const { result } = renderHook(() => useListToolbarViewModel({ q: '' }));

    act(() => result.current.onSearchChange(' abc '));
    act(() => vi.advanceTimersByTime(SEARCH_DELAY_MS - 1));
    expect(setFilters).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(setFilters).toHaveBeenCalledWith({ q: 'abc' });
  });

  it('keeps what the admin is typing when its own earlier write comes back', () => {
    const { result, rerender } = renderHook((filters) => useListToolbarViewModel(filters), {
      initialProps: { q: '' },
    });
    act(() => result.current.onSearchChange('ab'));
    act(() => vi.advanceTimersByTime(SEARCH_DELAY_MS));
    act(() => result.current.onSearchChange('abc'));

    rerender({ q: 'ab' });

    expect(result.current.search).toBe('abc');
  });

  it('replaces the box when the URL changes from elsewhere', () => {
    const { result, rerender } = renderHook((filters) => useListToolbarViewModel(filters), {
      initialProps: { q: 'abc' },
    });

    rerender({ q: '' });

    expect(result.current.search).toBe('');
    act(() => vi.advanceTimersByTime(SEARCH_DELAY_MS));
    expect(setFilters).not.toHaveBeenCalled();
  });

  it('maps "all" to no status and clears every filter', () => {
    const { result } = renderHook(() => useListToolbarViewModel({ q: 'abc', status: 'disabled' }));
    expect(result.current.hasFilters).toBe(true);

    act(() => result.current.onStatusChange('all'));
    expect(setFilters).toHaveBeenLastCalledWith({ status: undefined });

    act(() => result.current.clearFilters());
    expect(setFilters).toHaveBeenLastCalledWith({ q: undefined, status: undefined });
    expect(result.current.search).toBe('');
  });
});
