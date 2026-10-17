'use client';

import { CircleAlert, CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FormDescription, useFormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { ALIAS_MAX, ALIAS_MIN } from '../model/types';
import { useAliasFieldViewModel } from '../view-models/use-alias-field-view-model';

interface AliasFieldProps extends Omit<React.ComponentProps<'input'>, 'value'> {
  value: string;
}

/**
 * Alias input behind the short-link origin, with a live availability line in
 * the description slot. Rest props (id, aria-*) land on the input, so
 * `FormControl` wires it like any other field.
 */
export function AliasField({ value, className, ...inputProps }: AliasFieldProps) {
  const t = useTranslations('links');
  const { state, prefix } = useAliasFieldViewModel(value);
  const { error } = useFormField();

  // The form error already says what the hint would; show one, not both.
  let line: React.ReactNode = error ? null : t('aliasHint', { min: ALIAS_MIN, max: ALIAS_MAX });
  if (state.status === 'checking') {
    line = (
      <>
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
        {t('aliasChecking')}
      </>
    );
  } else if (state.status === 'available') {
    line = (
      <span className="flex items-center gap-1.5 text-success">
        <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
        {t('aliasAvailable', { alias: value })}
      </span>
    );
  } else if (state.status === 'taken' || state.status === 'reserved') {
    line = (
      <span className="flex items-center gap-1.5 text-destructive">
        <CircleX className="size-4 shrink-0" aria-hidden="true" />
        {state.status === 'taken'
          ? t('aliasTaken', { alias: value })
          : t('aliasReserved', { alias: value })}
      </span>
    );
  } else if (state.status === 'unknown') {
    line = (
      <>
        <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
        {t('aliasCheckFailed')}
      </>
    );
  }

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-2 sm:max-w-md', className)}>
      <div className="flex h-11 min-w-0 items-center rounded-lg border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20">
        <span className="max-w-1/3 shrink-0 truncate pl-3 font-mono text-base text-muted-foreground select-none sm:max-w-1/2 md:text-sm">
          {prefix}
        </span>
        <Input
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={ALIAS_MAX}
          placeholder={t('aliasPlaceholder')}
          className="h-full min-w-0 rounded-none border-0 bg-transparent pl-0 font-mono shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
          value={value}
          {...inputProps}
        />
      </div>
      {/* Stays mounted so screen readers keep the live region; hidden while empty. */}
      <FormDescription
        aria-live="polite"
        className="flex min-h-5 items-center gap-1.5 empty:hidden"
      >
        {line}
      </FormDescription>
    </div>
  );
}
