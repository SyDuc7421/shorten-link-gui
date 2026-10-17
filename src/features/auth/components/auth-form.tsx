'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import { Link, useRouter } from '@/i18n/navigation';
import { HttpError } from '@/lib/http';

import { useAuthMutation } from '../api/auth-api';
import { useSession } from '../hooks/use-session';

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

interface AuthFormProps {
  mode: 'signIn' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
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

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  // Already signed in (or just signed in): this page has nothing left to do.
  useEffect(() => {
    if (status === 'signedIn') router.replace('/');
  }, [status, router]);

  function handleSubmit(values: z.infer<typeof schema>) {
    form.clearErrors('root');
    mutation.mutate(values, {
      onError: (error) => {
        if (!(error instanceof HttpError)) {
          form.setError('root', { message: tErrors('network') });
        } else if (error.status === 401) {
          form.setError('root', { message: t('invalidCredentials') });
        } else if (error.status === 409) {
          form.setError('email', { message: t('emailTaken') }, { shouldFocus: true });
        } else if (error.status === 400 && isRegister) {
          form.setError('password', { message: t('weakPassword') }, { shouldFocus: true });
        } else if (error.status === 429) {
          form.setError('root', { message: t('tooManyAttempts') });
        } else {
          form.setError('root', { message: tErrors('server') });
        }
      },
    });
  }

  const rootError = form.formState.errors.root?.message;
  const isPending = mutation.isPending || mutation.isSuccess;

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
          <form
            method="post"
            noValidate
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
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
                      onClick={() => setIsPasswordVisible((visible) => !visible)}
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
