'use client';

import { CircleAlert, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

import { QUOTA_MAX, QUOTA_MIN, type AdminUserDetail } from '../model/types';
import { useQuotaFormViewModel } from '../view-models/use-quota-form-view-model';

export function QuotaForm({ user }: { user: AdminUserDetail }) {
  const t = useTranslations('admin.users');
  const tConfirm = useTranslations('admin.confirm');
  const { form, onSubmit, isPending, rootError } = useQuotaFormViewModel(user);

  return (
    <Card className="max-w-2xl">
      <CardHeader className="gap-1">
        <CardTitle>
          <h2 className="text-lg font-semibold">{t('quotaTitle')}</h2>
        </CardTitle>
        <CardDescription>{t('quotaDescription')}</CardDescription>
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
              name="quota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('quotaLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={QUOTA_MIN}
                      max={QUOTA_MAX}
                      step={1}
                      className="h-11 sm:max-w-40 md:h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tConfirm('reasonLabel')}</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormDescription>{tConfirm('reasonHint')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="h-11 self-start md:h-9" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t('quotaSave')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
