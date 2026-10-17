'use client';

import { useSessionStore } from './session-store';

export type SessionStatus = 'loading' | 'signedIn' | 'signedOut';

export function useSession() {
  const hasHydrated = useSessionStore((state) => state.hasHydrated);
  const isSignedIn = useSessionStore((state) => state.refreshToken !== null);
  const email = useSessionStore((state) => state.email);
  const signOut = useSessionStore((state) => state.signOut);

  let status: SessionStatus = 'signedOut';
  if (!hasHydrated) status = 'loading';
  else if (isSignedIn) status = 'signedIn';

  return { status, email, signOut };
}
