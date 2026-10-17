import { Skeleton } from '@/components/ui/skeleton';

import { LinkList, LinkListSkeleton } from './link-list';
import { ShortenForm } from './shorten-form';

export function LinksDashboard() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8 md:px-6">
      <ShortenForm />
      <LinkList />
    </main>
  );
}

export function LinksDashboardSkeleton() {
  return (
    <main
      id="main"
      aria-busy="true"
      className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8 md:px-6"
    >
      <div className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-md">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <LinkListSkeleton />
      </div>
    </main>
  );
}
