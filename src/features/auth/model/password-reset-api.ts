import { useMutation } from '@tanstack/react-query';

import { http } from '@/lib/http';

/** `202` whether or not the email is registered — the response reveals nothing. */
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      await http<null>('/api/auth/forgot-password', { method: 'POST', body: { email } });
    },
  });
}

interface ResetPasswordInput {
  token: string;
  password: string;
}

/** `204` on success; the API has revoked every session, so the user signs in again. */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (input: ResetPasswordInput) => {
      await http<null>('/api/auth/reset-password', { method: 'POST', body: input });
    },
  });
}
