'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getAliasProblem } from '../model/alias';
import { localDateTimeToRfc3339 } from '../model/display-url';
import { useShortenLink } from '../model/links-api';
import { toShortenFailure } from '../model/shorten-errors';
import { ALIAS_MAX, ALIAS_MIN, type ShortenedLink } from '../model/types';

const ALIAS_LIMITS = { min: ALIAS_MIN, max: ALIAS_MAX };

function createSchema(t: ReturnType<typeof useTranslations<'links'>>) {
  return z.object({
    url: z
      .string()
      .trim()
      .pipe(z.url({ protocol: /^https?$/, hostname: z.regexes.domain, error: t('invalidUrl') })),
    alias: z.string().superRefine((value, ctx) => {
      if (!value) return;
      const problem = getAliasProblem(value);
      if (problem === 'invalid') {
        ctx.addIssue({ code: 'custom', message: t('aliasInvalid', ALIAS_LIMITS) });
      } else if (problem === 'reserved') {
        ctx.addIssue({ code: 'custom', message: t('aliasReserved', { alias: value }) });
      }
    }),
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
  const [hasAlias, setHasAlias] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [result, setResult] = useState<ShortenedLink | null>(null);

  const form = useForm<ShortenFormInput, unknown, ShortenFormValues>({
    resolver: zodResolver(createSchema(t)),
    mode: 'onTouched',
    defaultValues: { url: '', alias: '', expiresAt: '' },
  });

  function removeAlias() {
    setHasAlias(false);
    form.resetField('alias');
  }

  function removeExpiry() {
    setHasExpiry(false);
    form.resetField('expiresAt');
  }

  function submit(values: ShortenFormValues) {
    form.clearErrors('root');
    const expiresAt =
      hasExpiry && values.expiresAt ? localDateTimeToRfc3339(values.expiresAt) : null;

    const alias = hasAlias && values.alias ? values.alias : null;

    mutation.mutate(
      { url: values.url, alias, expiresAt },
      {
        onSuccess: (link) => {
          setResult(link);
          form.reset();
          setHasAlias(false);
          setHasExpiry(false);
        },
        onError: (error) => {
          const failure = toShortenFailure(error);
          if (failure.field === 'root') {
            const message =
              failure.reason === 'rateLimited' ? t('rateLimited') : tErrors(failure.reason);
            form.setError('root', { message });
          } else if (failure.field === 'alias') {
            const message =
              failure.reason === 'aliasTaken'
                ? t('aliasTaken', { alias: values.alias })
                : t('aliasInvalid', ALIAS_LIMITS);
            form.setError('alias', { message }, { shouldFocus: true });
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
    hasAlias,
    addAlias: () => setHasAlias(true),
    removeAlias,
    hasExpiry,
    addExpiry: () => setHasExpiry(true),
    removeExpiry,
    result,
  };
}
