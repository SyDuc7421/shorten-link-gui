import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TokenPair } from './types';

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  /** False until the persisted session has been read from storage. */
  hasHydrated: boolean;
  signIn: (tokens: TokenPair, email: string) => void;
  setTokens: (tokens: TokenPair) => void;
  signOut: () => void;
}

/**
 * Client-side session. The API issues bearer tokens in the response body, so
 * they are kept in localStorage; hydration is deferred to an effect
 * (`SessionProvider`) so server and first client render agree.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      email: null,
      hasHydrated: false,
      signIn: (tokens, email) =>
        set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, email }),
      setTokens: (tokens) =>
        set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token }),
      signOut: () => set({ accessToken: null, refreshToken: null, email: null }),
    }),
    {
      name: 'shortlink-session',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ accessToken, refreshToken, email }) => ({ accessToken, refreshToken, email }),
      onRehydrateStorage: () => () => useSessionStore.setState({ hasHydrated: true }),
    },
  ),
);
