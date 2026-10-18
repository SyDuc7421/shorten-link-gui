'use client';

import { LogOut, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useRouter } from '@/i18n/navigation';

import { useSession } from '../model/use-session';

interface AccountMenuProps {
  /** Entries from other features (admin), shown above Sign out. */
  items?: React.ReactNode;
}

/** Header slot: sign-in links when signed out, the account menu when signed in. */
export function AccountMenu({ items }: AccountMenuProps) {
  const t = useTranslations('nav');
  const router = useRouter();
  const { status, email, signOut } = useSession();

  if (status === 'loading') return <Skeleton className="h-11 w-24 md:h-9" />;

  if (status === 'signedOut') {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="h-11 md:h-9">
          <Link href="/login">{t('signIn')}</Link>
        </Button>
        <Button asChild className="h-11 md:h-9">
          <Link href="/register">{t('getStarted')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-11 max-w-48 min-w-11 md:h-9 md:max-w-64">
          <User aria-hidden="true" />
          <span className="sr-only">{t('account')}</span>
          <span aria-hidden="true" className="hidden truncate sm:inline">
            {email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-xs font-normal text-muted-foreground">{t('signedInAs')}</span>
          <span className="truncate">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items}
        <DropdownMenuItem
          onSelect={() => {
            signOut();
            router.replace('/');
          }}
        >
          <LogOut aria-hidden="true" />
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
