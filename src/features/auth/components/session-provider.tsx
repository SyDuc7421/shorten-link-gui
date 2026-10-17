'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSessionStore } from '../store';

/** Reads the persisted session after mount and keeps it in sync across tabs. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    void useSessionStore.persist.rehydrate();

    // Never show one account's cached links to the next account.
    const unsubscribe = useSessionStore.subscribe((state, previous) => {
      if (previous.refreshToken && !state.refreshToken) queryClient.clear();
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key === useSessionStore.persist.getOptions().name) {
        void useSessionStore.persist.rehydrate();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
  }, [queryClient]);

  return children;
}
