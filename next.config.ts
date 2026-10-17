import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fail the production build on type errors. Never disable this.
  // (Next.js 16 no longer lints during build — `pnpm verify` runs ESLint.)
  typescript: { ignoreBuildErrors: false },
  images: {
    remotePatterns: [
      // { protocol: 'https', hostname: 'cdn.example.com' },
    ],
  },
};

// Points at src/i18n/request.ts by convention.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
