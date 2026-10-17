import { useMutation } from '@tanstack/react-query';

import { http } from '@/lib/http';

import { useSessionStore } from '../store';
import { tokenPairSchema, type Credentials } from '../types';

async function requestTokens(path: string, credentials: Credentials) {
  return tokenPairSchema.parse(await http<unknown>(path, { method: 'POST', body: credentials }));
}

export function useAuthMutation(mode: 'signIn' | 'register') {
  const signIn = useSessionStore((state) => state.signIn);
  const path = mode === 'signIn' ? '/api/auth/login' : '/api/auth/register';

  return useMutation({
    mutationFn: (credentials: Credentials) => requestTokens(path, credentials),
    onSuccess: (tokens, credentials) => signIn(tokens, credentials.email.trim().toLowerCase()),
  });
}
