'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  /** Owned by the form's view-model so one toggle can drive several fields. */
  isVisible: boolean;
  onToggleVisible: () => void;
}

/** Password field with a show/hide toggle. Rest props (id, aria-*) land on the input. */
export function PasswordInput({
  isVisible,
  onToggleVisible,
  className,
  ...inputProps
}: PasswordInputProps) {
  const t = useTranslations('auth');

  return (
    <div className="relative">
      <Input
        type={isVisible ? 'text' : 'password'}
        className={cn('h-11 pr-12', className)}
        {...inputProps}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 size-11"
        aria-label={isVisible ? t('hidePassword') : t('showPassword')}
        aria-pressed={isVisible}
        onClick={onToggleVisible}
      >
        {isVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </Button>
    </div>
  );
}
