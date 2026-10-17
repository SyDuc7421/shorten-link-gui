import createMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`. next-intl's locale
 * negotiation depends on this file running — if it is named `middleware.ts`,
 * locale detection silently stops working.
 */
export default createMiddleware(routing);

export const config = {
  // Skip API routes, static assets and anything with a file extension.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
