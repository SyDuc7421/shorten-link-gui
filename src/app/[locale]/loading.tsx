import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-12 md:px-6"
    >
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
