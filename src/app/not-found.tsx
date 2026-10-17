import '@/app/globals.css';

/**
 * Catches requests that never reached the locale segment (unknown locale,
 * or a path the proxy skipped). No translations are available here.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 px-6 text-center">
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p className="text-muted-foreground">
            The page you asked for does not exist or was moved.
          </p>
        </main>
      </body>
    </html>
  );
}
