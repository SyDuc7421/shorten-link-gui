'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

import { TooltipProvider } from '@/components/ui/tooltip';
import { SessionProvider } from '@/features/auth';
import { getQueryClient } from '@/lib/query-client';

/**
 * The only client boundary at the root. Add providers here, never by turning a
 * layout or page into a client component.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SessionProvider>
        <Toaster richColors closeButton position="top-center" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
