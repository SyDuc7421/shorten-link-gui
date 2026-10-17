import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Already translated by the caller — this component is domain-agnostic. */
  title: string;
  /** Say what this screen holds and what to do first. */
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground ring-1 ring-primary/10">
          {icon}
        </div>
      ) : null}
      <p className="font-medium">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
