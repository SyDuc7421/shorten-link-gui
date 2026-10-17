'use client';

import { CircleAlert, Eye, EyeOff, Loader2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';

import { useAuthFormViewModel, type AuthMode } from '../view-models/use-auth-form-view-model';

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations('auth');
  const {
    form,
    onSubmit,
    isRegister,
    isPending,
    rootError,
    isPasswordVisible,
    togglePasswordVisible,
  } = useAuthFormViewModel(mode);

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="gap-2">
        <CardTitle>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isRegister ? t('registerTitle') : t('signInTitle')}
          </h1>
        </CardTitle>
        <CardDescription>
          {isRegister ? t('registerDescription') : t('signInDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={isPasswordVisible ? 'text' : 'password'}
                        autoComplete={isRegister ? 'new-password' : 'current-password'}
                        className="h-11 pr-12"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 size-11"
                      aria-label={isPasswordVisible ? t('hidePassword') : t('showPassword')}
                      aria-pressed={isPasswordVisible}
                      onClick={togglePasswordVisible}
                    >
                      {isPasswordVisible ? (
                        <EyeOff aria-hidden="true" />
                      ) : (
                        <Eye aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                  {isRegister ? <FormDescription>{t('passwordHint')}</FormDescription> : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="h-11 w-full" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {isRegister ? t('registerSubmit') : t('signInSubmit')}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          {isRegister ? t('hasAccount') : t('noAccount')}{' '}
          <Link
            href={isRegister ? '/login' : '/register'}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {isRegister ? t('toSignIn') : t('toRegister')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
