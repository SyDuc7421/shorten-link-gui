'use client';

import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { useCopyButtonViewModel } from '../view-models/use-copy-button-view-model';

interface CopyButtonProps {
  value: string;
  /**
   * `labelled` always shows the text label. `compact` shows it below `lg` (no
   * hover on touch) and becomes icon + tooltip from `lg` up.
   */
  appearance: 'labelled' | 'compact';
  variant?: 'secondary' | 'outline';
  className?: string;
}

export function CopyButton({ value, appearance, variant = 'outline', className }: CopyButtonProps) {
  const t = useTranslations('common');
  const tLinks = useTranslations('links');
  const { isCopied, copy } = useCopyButtonViewModel(value);

  const label = isCopied ? t('copied') : t('copy');
  const icon = isCopied ? (
    <Check className="text-success" aria-hidden="true" />
  ) : (
    <Copy aria-hidden="true" />
  );

  if (appearance === 'labelled') {
    return (
      <Button type="button" variant={variant} className={cn('h-11', className)} onClick={copy}>
        {icon}
        <span aria-live="polite">{label}</span>
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          className={cn('h-11 lg:size-9 lg:px-0', className)}
          onClick={copy}
        >
          {icon}
          <span className="lg:sr-only" aria-live="polite">
            {label}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isCopied ? t('copied') : tLinks('copyLink')}</TooltipContent>
    </Tooltip>
  );
}
