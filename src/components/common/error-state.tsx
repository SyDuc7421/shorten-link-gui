'use client';

import { CircleAlert, RotateCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  /** Override only when you can say something more specific than the default. */
  title?: string;
  /** Say what failed and what the person can do about it. Never just "Error". */
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title, description, onRetry, className }: ErrorStateProps) {
  const t = useTranslations('states');
  const tCommon = useTranslations('common');

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border px-6 py-16 text-center',
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <CircleAlert className="size-5" aria-hidden="true" />
      </span>
      <p className="font-medium">{title ?? t('errorTitle')}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {description ?? t('errorDescription')}
      </p>
      {onRetry ? (
        <Button type="button" variant="outline" className="h-11 md:h-9" onClick={onRetry}>
          <RotateCw aria-hidden="true" />
          {tCommon('retry')}
        </Button>
      ) : null}
    </div>
  );
}
