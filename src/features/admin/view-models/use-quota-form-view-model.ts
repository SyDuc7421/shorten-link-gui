'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { toAdminFailure } from '../model/admin-errors';
import { isReasonWithinMax, QUOTA_MAX, QUOTA_MIN, type AdminUserDetail } from '../model/types';
import { useUpdateUserQuota } from '../model/users-api';

export function useQuotaFormViewModel(user: AdminUserDetail) {
  const t = useTranslations('admin.users');
  const tErrors = useTranslations('admin.errors');
  const mutation = useUpdateUserQuota();

  const quotaMessage = t('quotaInvalid', { min: QUOTA_MIN, max: QUOTA_MAX });
  // The input hands over a string; whole digits only, so "1.5" and "-1" fail here.
  const schema = z.object({
    quota: z
      .string()
      .trim()
      .regex(/^\d{1,6}$/, quotaMessage)
      .refine((value) => Number(value) <= QUOTA_MAX, quotaMessage),
    reason: z.string().trim().refine(isReasonWithinMax, tErrors('reasonTooLong')),
  });
  type QuotaValues = z.infer<typeof schema>;

  const form = useForm<QuotaValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { quota: String(user.quota_daily), reason: '' },
  });

  function submit({ quota, reason }: QuotaValues) {
    form.clearErrors('root');
    mutation.mutate(
      { id: user.id, quotaDaily: Number(quota), reason: reason || null },
      {
        onSuccess: (updated) => {
          form.reset({ quota: String(updated.quota_daily), reason: '' });
          toast.success(t('quotaSaved'));
        },
        onError: (error) => form.setError('root', { message: tErrors(toAdminFailure(error)) }),
      },
    );
  }

  return {
    form,
    onSubmit: form.handleSubmit(submit),
    isPending: mutation.isPending,
    rootError: form.formState.errors.root?.message,
  };
}
