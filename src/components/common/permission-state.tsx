import { cn } from '@/lib/utils';

type PermissionReason = 'noPermission' | 'featureDisabled' | 'planRequired' | 'notAvailableYet';

interface PermissionStateProps {
  reason: PermissionReason;
  /** Already translated by the caller. Name who can do this, or what unlocks it. */
  title: string;
  description?: string;
  /** The path forward: request access, upgrade, enable the feature. */
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * The user cannot do this — nothing failed. Never styled as an error, never
 * routed to the error boundary. See DESIGN.md §10.
 */
export function PermissionState({
  reason,
  title,
  description,
  action,
  icon,
  className,
}: PermissionStateProps) {
  return (
    <div
      data-reason={reason}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 px-6 py-16 text-center',
        className,
      )}
    >
      {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      <p className="font-medium">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
