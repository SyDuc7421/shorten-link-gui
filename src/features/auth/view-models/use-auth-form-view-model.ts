'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useRouter } from '@/i18n/navigation';

import { useAuthMutation } from '../model/auth-api';
import { toAuthFailure } from '../model/auth-errors';
import { PASSWORD_MAX, PASSWORD_MIN } from '../model/types';
import { useSession } from '../model/use-session';

export type AuthMode = 'signIn' | 'register';

export function useAuthFormViewModel(mode: AuthMode) {
  const t = useTranslations('auth');
  const tValidation = useTranslations('validation');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  const { status } = useSession();
  const mutation = useAuthMutation(mode);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isRegister = mode === 'register';

  const schema = z.object({
    email: z.email(tValidation('email')),
    password: isRegister
      ? z
          .string()
          .min(PASSWORD_MIN, tValidation('minLength', { count: PASSWORD_MIN }))
          .max(PASSWORD_MAX, tValidation('maxLength', { count: PASSWORD_MAX }))
      : z.string().min(1, tValidation('required')),
  });
  type AuthFormValues = z.infer<typeof schema>;

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  // Already signed in (or just signed in): this page has nothing left to do.
  useEffect(() => {
    if (status === 'signedIn') router.replace('/');
  }, [status, router]);

  function submit(values: AuthFormValues) {
    form.clearErrors('root');
    mutation.mutate(values, {
      onError: (error) => {
        const failure = toAuthFailure(error, mode);
        if (failure.field === 'root') {
          const message =
            failure.reason === 'network' || failure.reason === 'server'
              ? tErrors(failure.reason)
              : t(failure.reason);
          form.setError('root', { message });
        } else {
          form.setError(failure.field, { message: t(failure.reason) }, { shouldFocus: true });
        }
      },
    });
  }

  return {
    form,
    onSubmit: form.handleSubmit(submit),
    isRegister,
    // Stay busy after success until the redirect lands.
    isPending: mutation.isPending || mutation.isSuccess,
    rootError: form.formState.errors.root?.message,
    isPasswordVisible,
    togglePasswordVisible: () => setIsPasswordVisible((visible) => !visible),
  };
}
