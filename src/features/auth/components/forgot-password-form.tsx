'use client';

import { ArrowLeft, CircleAlert, Loader2, MailCheck, RotateCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';

import { useForgotPasswordViewModel } from '../view-models/use-forgot-password-view-model';
import { AuthStatusCard } from './auth-status-card';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const { state, form, onSubmit, isPending, rootError } = useForgotPasswordViewModel();

  const errorAlert = rootError ? (
    <Alert variant="destructive">
      <CircleAlert aria-hidden="true" />
      <AlertDescription>{rootError}</AlertDescription>
    </Alert>
  ) : null;

  if (state.status === 'sent') {
    return (
      <AuthStatusCard
        tone="success"
        icon={<MailCheck className="size-6" aria-hidden="true" />}
        title={t('forgotSentTitle')}
        description={t('forgotSent', { email: state.email })}
      >
        {errorAlert}
        <Button asChild size="lg" className="h-11 w-full">
          <Link href="/login">{t('backToSignIn')}</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 w-full tabular-nums"
          disabled={isPending || state.resendIn > 0}
          onClick={state.resend}
        >
          {isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <RotateCw aria-hidden="true" />
          )}
          {state.resendIn > 0 ? t('resendIn', { seconds: state.resendIn }) : t('resend')}
        </Button>
        {/* Mounted while the card is, so the confirmation is announced when it appears. */}
        <p role="status" className="text-center text-sm text-muted-foreground empty:hidden">
          {state.hasResent ? t('resent') : null}
        </p>
      </AuthStatusCard>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="gap-2">
        <CardTitle>
          <h1 className="text-2xl font-semibold tracking-tight">{t('forgotTitle')}</h1>
        </CardTitle>
        <CardDescription>{t('forgotDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Form {...form}>
          <form method="post" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
            {errorAlert}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="h-11 w-full" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t('forgotSubmit')}
            </Button>
          </form>
        </Form>

        <Button asChild variant="ghost" className="h-11 self-center text-muted-foreground">
          <Link href="/login">
            <ArrowLeft aria-hidden="true" />
            {t('backToSignIn')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
