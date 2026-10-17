'use client';

import '@/app/globals.css';

/**
 * Last-resort boundary: it replaces the root layout, so the locale provider is
 * not available. Keep the copy hardcoded and minimal.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 px-6 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground">The app failed to load. Try again.</p>
          <button
            onClick={reset}
            className="mx-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
