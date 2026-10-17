import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@/test/utils';

import { useAliasAvailability } from '../model/links-api';
import { useAliasFieldViewModel } from './use-alias-field-view-model';

vi.mock('../model/links-api', () => ({ useAliasAvailability: vi.fn() }));

type Availability = ReturnType<typeof useAliasAvailability>;

function mockAvailability(result: Partial<Availability>) {
  vi.mocked(useAliasAvailability).mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    ...result,
  } as Availability);
}

describe('useAliasFieldViewModel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockAvailability({ isPending: true });
  });
  afterEach(() => vi.useRealTimers());

  it('shows the short-link origin as a prefix', () => {
    expect(renderHook(() => useAliasFieldViewModel('')).result.current.prefix).toBe(
      'localhost:8080/',
    );
  });

  it('never asks the API about empty, malformed or reserved aliases', () => {
    for (const alias of ['', 'a b', 'api']) {
      renderHook(() => useAliasFieldViewModel(alias));
      act(() => vi.advanceTimersByTime(1000));
    }
    expect(vi.mocked(useAliasAvailability).mock.calls.every(([, enabled]) => !enabled)).toBe(true);
  });

  it('flags a reserved alias without a request', () => {
    expect(renderHook(() => useAliasFieldViewModel('Docs')).result.current.state.status).toBe(
      'reserved',
    );
  });

  it('waits for a pause in typing before checking', () => {
    const { result, rerender } = renderHook(({ alias }) => useAliasFieldViewModel(alias), {
      initialProps: { alias: 'sal' },
    });
    rerender({ alias: 'sale' });
    expect(result.current.state.status).toBe('checking');
    expect(vi.mocked(useAliasAvailability)).toHaveBeenLastCalledWith('sal', false);

    act(() => vi.advanceTimersByTime(400));
    expect(vi.mocked(useAliasAvailability)).toHaveBeenLastCalledWith('sale', true);
  });

  it('reports available, taken and failed checks', () => {
    mockAvailability({ data: { alias: 'sale', available: true } });
    expect(renderHook(() => useAliasFieldViewModel('sale')).result.current.state.status).toBe(
      'available',
    );

    mockAvailability({ data: { alias: 'sale', available: false, reason: 'taken' } });
    expect(renderHook(() => useAliasFieldViewModel('sale')).result.current.state.status).toBe(
      'taken',
    );

    mockAvailability({ isError: true });
    expect(renderHook(() => useAliasFieldViewModel('sale')).result.current.state.status).toBe(
      'unknown',
    );
  });
});
