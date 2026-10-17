'use client';

import { useSession } from '../model/use-session';

interface SessionGateProps {
  signedIn: React.ReactNode;
  signedOut: React.ReactNode;
  /** Shown until the stored session has been read — shaped like `signedIn`. */
  fallback: React.ReactNode;
}

export function SessionGate({ signedIn, signedOut, fallback }: SessionGateProps) {
  const { status } = useSession();

  if (status === 'loading') return fallback;
  return status === 'signedIn' ? signedIn : signedOut;
}
