'use client';

import { Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';

import { useAdminMenuItemViewModel } from '../view-models/use-admin-menu-item-view-model';

/** Account-menu entry. The menu mounts its content on open, so the check runs then. */
export function AdminMenuItem() {
  const t = useTranslations('nav');
  const { isVisible } = useAdminMenuItemViewModel();

  if (!isVisible) return null;

  return (
    <>
      <DropdownMenuItem asChild>
        <Link href="/admin">
          <Shield aria-hidden="true" />
          {t('admin')}
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
    </>
  );
}
