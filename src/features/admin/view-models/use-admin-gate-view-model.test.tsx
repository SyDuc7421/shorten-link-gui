import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth';
import { useRouter } from '@/i18n/navigation';
import { HttpError } from '@/lib/http';
import { renderHook } from '@/test/utils';

import { useAdminMe } from '../model/me-api';
import { useAdminGateViewModel } from './use-admin-gate-view-model';

vi.mock('@/features/auth', () => ({ useSession: vi.fn() }));
vi.mock('@/i18n/navigation', () => ({ useRouter: vi.fn() }));
vi.mock('../model/me-api', () => ({ useAdminMe: vi.fn() }));

const router = { replace: vi.fn() };
const refetch = vi.fn();
const admin = { id: '1', email: 'admin@example.com', role: 'admin' };

function mock(session: 'loading' | 'signedIn' | 'signedOut', me: Record<string, unknown>) {
  vi.mocked(useSession).mockReturnValue({
    status: session,
    email: null,
    signOut: vi.fn(),
  });
  vi.mocked(useAdminMe).mockReturnValue({ refetch, ...me } as unknown as ReturnType<
    typeof useAdminMe
  >);
}

describe('useAdminGateViewModel', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(router as unknown as ReturnType<typeof useRouter>);
  });

  it('waits while the session or the check is loading', () => {
    mock('loading', { status: 'pending' });
    expect(renderHook(() => useAdminGateViewModel()).result.current).toEqual({
      status: 'pending',
    });
  });

  it('sends a signed-out visitor to sign in', () => {
    mock('signedOut', { status: 'pending' });
    renderHook(() => useAdminGateViewModel());
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  it('treats 403 as a permission state, not an error', () => {
    mock('signedIn', { status: 'error', error: new HttpError(403, { error: 'forbidden' }) });
    expect(renderHook(() => useAdminGateViewModel()).result.current).toEqual({
      status: 'forbidden',
    });
  });

  it('offers retry for any other failure', () => {
    mock('signedIn', { status: 'error', error: new TypeError('offline') });
    const state = renderHook(() => useAdminGateViewModel()).result.current;
    if (state.status !== 'error') throw new Error(`unexpected ${state.status}`);
    state.retry();
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('keeps an admin in when a background re-check fails', () => {
    mock('signedIn', { status: 'error', error: new TypeError('offline'), data: admin });
    expect(renderHook(() => useAdminGateViewModel()).result.current).toEqual({
      status: 'allowed',
    });
  });

  it('locks the area when a re-check says access was revoked', () => {
    mock('signedIn', { status: 'error', error: new HttpError(403, null), data: admin });
    expect(renderHook(() => useAdminGateViewModel()).result.current).toEqual({
      status: 'forbidden',
    });
  });

  it('lets an admin in', () => {
    mock('signedIn', { status: 'success', data: admin });
    expect(renderHook(() => useAdminGateViewModel()).result.current).toEqual({
      status: 'allowed',
    });
  });
});
