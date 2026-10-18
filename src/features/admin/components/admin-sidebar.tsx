'use client';

import { LayoutDashboard, Link2, ScrollText, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'users', icon: Users },
  { href: '/admin/links', label: 'links', icon: Link2 },
  { href: '/admin/audit', label: 'audit', icon: ScrollText },
] as const;

/**
 * Four destinations: a wrapping row below lg, a column beside the content
 * from lg. One tree, no Sheet (DESIGN.md §21).
 */
export function AdminSidebar() {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')} className="lg:w-52 lg:shrink-0">
      <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/admin' ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-accent hover:text-accent-foreground lg:min-h-9',
                  isActive && 'bg-secondary font-semibold text-secondary-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {t(label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
