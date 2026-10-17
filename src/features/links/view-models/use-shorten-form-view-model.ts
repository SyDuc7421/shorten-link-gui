'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { localDateTimeToRfc3339 } from '../model/display-url';
import { useShortenLink } from '../model/links-api';
import { toShortenFailure } from '../model/shorten-errors';
import type { ShortenedLink } from '../model/types';

function createSchema(t: ReturnType<typeof useTranslations<'links'>>) {
  return z.object({
    url: z
      .string()
      .trim()
      .pipe(z.url({ protocol: /^https?$/, hostname: z.regexes.domain, error: t('invalidUrl') })),
    expiresAt: z
      .string()
      .refine((value) => !value || new Date(value).getTime() > Date.now(), t('expiryInPast')),
  });
}

type ShortenFormInput = z.input<ReturnType<typeof createSchema>>;
type ShortenFormValues = z.output<ReturnType<typeof createSchema>>;

export function useShortenFormViewModel() {
  const t = useTranslations('links');
  const tErrors = useTranslations('errors');
  const mutation = useShortenLink();
  const [hasExpiry, setHasExpiry] = useState(false);
  const [result, setResult] = useState<ShortenedLink | null>(null);

  const form = useForm<ShortenFormInput, unknown, ShortenFormValues>({
    resolver: zodResolver(createSchema(t)),
    mode: 'onTouched',
    defaultValues: { url: '', expiresAt: '' },
  });

  function removeExpiry() {
    setHasExpiry(false);
    form.resetField('expiresAt');
  }

  function submit(values: ShortenFormValues) {
    form.clearErrors('root');
    const expiresAt =
      hasExpiry && values.expiresAt ? localDateTimeToRfc3339(values.expiresAt) : null;

    mutation.mutate(
      { url: values.url, expiresAt },
      {
        onSuccess: (link) => {
          setResult(link);
          form.reset();
          setHasExpiry(false);
        },
        onError: (error) => {
          const failure = toShortenFailure(error);
          if (failure.field === 'root') {
            const message =
              failure.reason === 'rateLimited' ? t('rateLimited') : tErrors(failure.reason);
            form.setError('root', { message });
          } else {
            form.setError(failure.field, { message: t(failure.reason) }, { shouldFocus: true });
          }
        },
      },
    );
  }

  return {
    form,
    onSubmit: form.handleSubmit(submit),
    isPending: mutation.isPending,
    rootError: form.formState.errors.root?.message,
    hasExpiry,
    addExpiry: () => setHasExpiry(true),
    removeExpiry,
    result,
  };
}
