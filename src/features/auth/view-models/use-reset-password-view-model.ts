'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useRouter } from '@/i18n/navigation';

import { useResetPasswordMutation } from '../model/password-reset-api';
import { toResetPasswordFailure } from '../model/password-reset-errors';
import { isPasswordWithinMax, PASSWORD_MIN } from '../model/types';
import { useSession } from '../model/use-session';
import { useAuthErrorMessage } from './use-auth-error-message';

export type ResetPasswordState =
  { status: 'missingToken' } | { status: 'form' } | { status: 'done' } | { status: 'invalidToken' };

/**
 * @param initialToken The `?token=` from the reset link. Read once: the URL is
 *   cleaned straight away and the token lives only in memory from then on.
 */
export function useResetPasswordViewModel(initialToken: string | null) {
  const t = useTranslations('auth');
  const tValidation = useTranslations('validation');
  const errorMessage = useAuthErrorMessage();
  const router = useRouter();
  const { status, signOut } = useSession();
  const mutation = useResetPasswordMutation();
  const [token] = useState(initialToken);
  const [outcome, setOutcome] = useState<'form' | 'done' | 'invalidToken'>('form');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Keep the token out of history, screenshots and anything that reads the URL.
  useEffect(() => {
    if (initialToken) router.replace('/reset-password');
  }, [initialToken, router]);

  const schema = z
    .object({
      password: z
        .string()
        .min(PASSWORD_MIN, tValidation('minLength', { count: PASSWORD_MIN }))
        .refine(isPasswordWithinMax, t('passwordTooLong')),
      confirmPassword: z.string().min(1, tValidation('required')),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: t('passwordMismatch'),
      path: ['confirmPassword'],
    });
  type ResetPasswordValues = z.infer<typeof schema>;

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { password: '', confirmPassword: '' },
  });

  // The mismatch rule sits on the confirmation, so editing the password alone
  // would leave its verdict stale. Re-check it once the user has been there.
  useEffect(
    () =>
      form.subscribe({
        name: 'password',
        formState: { values: true },
        callback: () => {
          if (form.getFieldState('confirmPassword').isTouched) void form.trigger('confirmPassword');
        },
      }),
    [form],
  );

  function submit({ password }: ResetPasswordValues) {
    if (!token) return;
    form.clearErrors('root');
    mutation.mutate(
      { token, password },
      {
        onSuccess: () => {
          // The API revoked every session, this one included.
          signOut();
          setOutcome('done');
        },
        onError: (error) => {
          const failure = toResetPasswordFailure(error);
          if (failure.field === 'token') {
            setOutcome('invalidToken');
          } else if (failure.field === 'password') {
            form.setError('password', { message: t(failure.reason) }, { shouldFocus: true });
          } else {
            form.setError('root', { message: errorMessage(failure.reason) });
          }
        },
      },
    );
  }

  const state: ResetPasswordState = token ? { status: outcome } : { status: 'missingToken' };

  return {
    state,
    /** Signed in already: /forgot-password would bounce them home, so offer home instead. */
    isSignedIn: status === 'signedIn',
    form,
    onSubmit: form.handleSubmit(submit),
    isPending: mutation.isPending,
    rootError: form.formState.errors.root?.message,
    isPasswordVisible,
    togglePasswordVisible: () => setIsPasswordVisible((visible) => !visible),
  };
}
