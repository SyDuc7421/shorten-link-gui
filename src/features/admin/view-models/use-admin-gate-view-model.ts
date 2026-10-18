'use client';

import { useEffect } from 'react';

import { useSession } from '@/features/auth';
import { useRouter } from '@/i18n/navigation';

import { hasStatus } from '../model/admin-errors';
import { useAdminMe } from '../model/me-api';

export type AdminGateState =
  | { status: 'pending' }
  | { status: 'forbidden' }
  | { status: 'error'; retry: () => void }
  | { status: 'allowed' };

/** UX only — the API checks the role on every /api/admin request. */
export function useAdminGateViewModel(): AdminGateState {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const me = useAdminMe();

  useEffect(() => {
    if (sessionStatus === 'signedOut') router.replace('/login');
  }, [sessionStatus, router]);

  if (sessionStatus !== 'signedIn' || me.status === 'pending') return { status: 'pending' };
  // Signed in but not an (enabled) admin: nothing failed (DESIGN.md §10).
  if (hasStatus(me.error, 403)) return { status: 'forbidden' };
  // A failed re-check keeps an admin's screen; only a failed first check blocks it.
  if (!me.data) return { status: 'error', retry: () => void me.refetch() };
  return { status: 'allowed' };
}
