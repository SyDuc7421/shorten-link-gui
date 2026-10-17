import { cva, type VariantProps } from 'class-variance-authority';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const iconVariants = cva('flex size-12 items-center justify-center rounded-full ring-1', {
  variants: {
    tone: {
      success: 'bg-secondary text-secondary-foreground ring-primary/10',
      // A dead link is not an error the user caused — keep it calm (DESIGN.md §10).
      neutral: 'bg-muted text-muted-foreground ring-border',
    },
  },
});

/**
 * Stable on purpose: React calls a ref callback again whenever its identity
 * changes, and an inline one would pull focus back on every re-render (the
 * resend countdown re-renders each second).
 */
function focusOnMount(node: HTMLHeadingElement | null) {
  node?.focus();
}

interface AuthStatusCardProps extends VariantProps<typeof iconVariants> {
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Actions, primary first. */
  children: React.ReactNode;
}

/**
 * Where an auth flow ends up: link sent, password changed, link unusable. It
 * replaces the form, so focus moves to its heading — otherwise it would fall
 * back to <body> with the unmounted submit button.
 */
export function AuthStatusCard({ icon, title, description, tone, children }: AuthStatusCardProps) {
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-col items-center gap-4 text-center">
        <span className={iconVariants({ tone })}>{icon}</span>
        <div className="flex flex-col gap-2">
          <CardTitle>
            <h1
              ref={focusOnMount}
              tabIndex={-1}
              className="text-2xl font-semibold tracking-tight text-balance outline-none"
            >
              {title}
            </h1>
          </CardTitle>
          <CardDescription className="text-pretty">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{children}</CardContent>
    </Card>
  );
}
