import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

/**
 * Read-only mode: the content stays fully visible, editing affordances are
 * hidden, and one notice explains why. Not an error. See DESIGN.md §10.
 */
export function ReadOnlyNotice({ message, className }: { message?: string; className?: string }) {
  const t = useTranslations('permissions');

  return (
    <div
      role="status"
      className={cn('rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground', className)}
    >
      {message ?? t('readOnly')}
    </div>
  );
}
