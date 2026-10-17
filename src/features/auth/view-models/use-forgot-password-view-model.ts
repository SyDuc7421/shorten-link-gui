'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useRouter } from '@/i18n/navigation';

import { useForgotPasswordMutation } from '../model/password-reset-api';
import { toForgotPasswordFailure } from '../model/password-reset-errors';
import { useSession } from '../model/use-session';
import { useAuthErrorMessage } from './use-auth-error-message';

/** The API sends at most one mail per address per minute and stays silent otherwise. */
export const RESEND_COOLDOWN_SECONDS = 60;

export type ForgotPasswordState =
  | { status: 'form' }
  | {
      status: 'sent';
      email: string;
      /** Seconds until another mail can actually go out; 0 when resend is available. */
      resendIn: number;
      hasResent: boolean;
      resend: () => void;
    };

export function useForgotPasswordViewModel() {
  const tValidation = useTranslations('validation');
  const errorMessage = useAuthErrorMessage();
  const router = useRouter();
  const { status } = useSession();
  const mutation = useForgotPasswordMutation();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [hasResent, setHasResent] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const schema = z.object({ email: z.email(tValidation('email')) });
  type ForgotPasswordValues = z.infer<typeof schema>;

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  // A signed-in user has a password they know; nothing to do here.
  useEffect(() => {
    if (status === 'signedIn') router.replace('/');
  }, [status, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timeout = window.setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [resendIn]);

  function send(email: string, isResend: boolean) {
    form.clearErrors('root');
    // A stale "Sent again" next to a failed resend would contradict it.
    setHasResent(false);
    mutation.mutate(email, {
      onSuccess: () => {
        setSentTo(email);
        setHasResent(isResend);
        setResendIn(RESEND_COOLDOWN_SECONDS);
      },
      onError: (error) => {
        form.setError('root', { message: errorMessage(toForgotPasswordFailure(error).reason) });
      },
    });
  }

  const state: ForgotPasswordState =
    sentTo === null
      ? { status: 'form' }
      : { status: 'sent', email: sentTo, resendIn, hasResent, resend: () => send(sentTo, true) };

  return {
    state,
    form,
    onSubmit: form.handleSubmit((values) => send(values.email, false)),
    isPending: mutation.isPending,
    rootError: form.formState.errors.root?.message,
  };
}
