'use client';

import {
  CalendarClock,
  CircleAlert,
  CircleCheck,
  ExternalLink,
  Link2,
  Loader2,
  X,
} from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

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

import { toDisplayUrl } from '../model/display-url';
import type { ShortenedLink } from '../model/types';
import { useShortenFormViewModel } from '../view-models/use-shorten-form-view-model';
import { CopyButton } from './copy-button';
import { ExpiryPicker } from './expiry-picker';

export function ShortenForm() {
  const t = useTranslations('links');
  const { form, onSubmit, isPending, rootError, hasExpiry, addExpiry, removeExpiry, result } =
    useShortenFormViewModel();

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
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
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
                      disabled={isPending}
                    >
                      {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
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
                        <ExpiryPicker {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11 md:size-9"
                        aria-label={t('removeExpiry')}
                        onClick={removeExpiry}
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
                onClick={addExpiry}
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
