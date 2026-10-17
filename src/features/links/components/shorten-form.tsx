'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarClock,
  CircleAlert,
  CircleCheck,
  ExternalLink,
  Link2,
  Loader2,
  X,
} from 'lucide-react';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { HttpError } from '@/lib/http';

import { useShortenLink } from '../api/links-api';
import { localDateTimeToRfc3339, nowAsLocalDateTime, toDisplayUrl } from '../lib/display-url';
import type { ShortenedLink } from '../types';
import { CopyButton } from './copy-button';

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

type ShortenFormValues = z.output<ReturnType<typeof createSchema>>;

export function ShortenForm() {
  const t = useTranslations('links');
  const tErrors = useTranslations('errors');
  const mutation = useShortenLink();
  const [hasExpiry, setHasExpiry] = useState(false);
  const [result, setResult] = useState<ShortenedLink | null>(null);

  const schema = createSchema(t);
  const now = useNow();

  const form = useForm<z.input<typeof schema>, unknown, ShortenFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { url: '', expiresAt: '' },
  });

  function handleRemoveExpiry() {
    setHasExpiry(false);
    form.resetField('expiresAt');
  }

  function handleSubmit(values: ShortenFormValues) {
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
          if (!(error instanceof HttpError)) {
            form.setError('root', { message: tErrors('network') });
            return;
          }
          const message = String(
            (error.body as { error?: unknown } | null)?.error ?? '',
          ).toLowerCase();
          if (error.status === 400 && message.includes('expires_at')) {
            form.setError('expiresAt', { message: t('expiryInPast') }, { shouldFocus: true });
          } else if (error.status === 400) {
            form.setError('url', { message: t('unresolvableUrl') }, { shouldFocus: true });
          } else if (error.status === 422) {
            form.setError('url', { message: t('forbiddenUrl') }, { shouldFocus: true });
          } else if (error.status === 429) {
            form.setError('root', { message: t('rateLimited') });
          } else {
            form.setError('root', { message: tErrors('server') });
          }
        },
      },
    );
  }

  const rootError = form.formState.errors.root?.message;

  return (
    <Card className="relative isolate gap-6 overflow-hidden shadow-md">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-48 bg-glow" />
      <CardHeader className="gap-2">
        <CardTitle>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {t('shortenTitle')}
          </h1>
        </CardTitle>
        <CardDescription>{t('shortenDescription')}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('urlLabel')}</FormLabel>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <Link2
                        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <FormControl>
                        <Input
                          type="url"
                          inputMode="url"
                          autoComplete="off"
                          spellCheck={false}
                          placeholder={t('urlPlaceholder')}
                          className="h-12 rounded-lg bg-background pl-10 text-base md:text-base"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 rounded-lg px-6 text-base shadow-sm sm:min-w-36"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                      ) : null}
                      {t('submit')}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasExpiry ? (
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('expiryLabel')}</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="datetime-local"
                          min={nowAsLocalDateTime(now)}
                          className="h-11 min-w-0 sm:max-w-64"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11 md:size-9"
                        aria-label={t('removeExpiry')}
                        onClick={handleRemoveExpiry}
                      >
                        <X aria-hidden="true" />
                      </Button>
                    </div>
                    <FormDescription>{t('expiryHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="h-11 self-start text-muted-foreground md:h-9"
                onClick={() => setHasExpiry(true)}
              >
                <CalendarClock aria-hidden="true" />
                {t('addExpiry')}
              </Button>
            )}

            {rootError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertDescription>{rootError}</AlertDescription>
              </Alert>
            ) : null}
          </form>
        </Form>

        {result ? <ShortenResult link={result} /> : null}
      </CardContent>
    </Card>
  );
}

function ShortenResult({ link }: { link: ShortenedLink }) {
  const t = useTranslations('links');
  const format = useFormatter();
  const tCommon = useTranslations('common');

  return (
    <div
      role="status"
      className="flex animate-in flex-col gap-3 rounded-lg border border-primary/20 bg-secondary/60 p-4 duration-(--duration-slow) fade-in-0 slide-in-from-bottom-1"
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <CircleCheck className="size-4 text-success" aria-hidden="true" />
        {t('resultTitle')}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={link.short_url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 truncate font-mono text-lg font-semibold text-secondary-foreground underline-offset-4 hover:underline"
        >
          {toDisplayUrl(link.short_url)}
        </a>
        <div className="flex gap-2">
          <CopyButton value={link.short_url} appearance="labelled" variant="secondary" />
          <Button asChild variant="ghost" className="h-11">
            <a href={link.short_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" />
              {tCommon('open')}
            </a>
          </Button>
        </div>
      </div>
      {link.expires_at ? (
        <p className="text-sm text-muted-foreground">
          {t('resultExpires', {
            date: format.dateTime(new Date(link.expires_at), {
              dateStyle: 'medium',
              timeStyle: 'short',
            }),
          })}
        </p>
      ) : null}
    </div>
  );
}
