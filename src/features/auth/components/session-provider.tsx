'use client';

import { useSessionSync } from '../model/use-session-sync';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useSessionSync();
  return children;
}
