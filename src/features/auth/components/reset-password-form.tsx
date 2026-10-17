'use client';

import { CircleAlert, CircleCheck, Link2Off, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
import { Link } from '@/i18n/navigation';

import { useResetPasswordViewModel } from '../view-models/use-reset-password-view-model';
import { AuthStatusCard } from './auth-status-card';
import { PasswordInput } from './password-input';

interface ResetPasswordFormProps {
  /** `?token=` from the emailed link, or `null` when it is missing. */
  token: string | null;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations('auth');
  const {
    state,
    isSignedIn,
    form,
    onSubmit,
    isPending,
    rootError,
    isPasswordVisible,
    togglePasswordVisible,
  } = useResetPasswordViewModel(token);

  if (state.status === 'done') {
    return (
      <AuthStatusCard
        tone="success"
        icon={<CircleCheck className="size-6" aria-hidden="true" />}
        title={t('resetDoneTitle')}
        description={t('resetDone')}
      >
        <Button asChild size="lg" className="h-11 w-full">
          <Link href="/login">{t('toSignIn')}</Link>
        </Button>
      </AuthStatusCard>
    );
  }

  if (state.status === 'missingToken' || state.status === 'invalidToken') {
    const isMissing = state.status === 'missingToken';
    return (
      <AuthStatusCard
        tone="neutral"
        icon={<Link2Off className="size-6" aria-hidden="true" />}
        title={isMissing ? t('resetMissingTitle') : t('resetExpiredTitle')}
        description={isMissing ? t('resetMissingDescription') : t('resetExpiredDescription')}
      >
        {isSignedIn ? (
          <Button asChild size="lg" className="h-11 w-full">
            <Link href="/">{t('toHome')}</Link>
          </Button>
        ) : (
          <>
            <Button asChild size="lg" className="h-11 w-full">
              <Link href="/forgot-password">{t('requestNewLink')}</Link>
            </Button>
            <Button asChild variant="ghost" className="h-11 w-full text-muted-foreground">
              <Link href="/login">{t('backToSignIn')}</Link>
            </Button>
          </>
        )}
      </AuthStatusCard>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="gap-2">
        <CardTitle>
          <h1 className="text-2xl font-semibold tracking-tight">{t('resetTitle')}</h1>
        </CardTitle>
        <CardDescription>{t('resetDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form method="post" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
            {rootError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertDescription>{rootError}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('newPassword')}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      isVisible={isPasswordVisible}
                      onToggleVisible={togglePasswordVisible}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('passwordHint')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmPassword')}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      isVisible={isPasswordVisible}
                      onToggleVisible={togglePasswordVisible}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="h-11 w-full" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t('resetSubmit')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
