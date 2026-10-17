export const siteConfig = {
  name: 'Shortlink',
  description: 'Shorten long URLs, set an expiry, and see how often each link is opened.',
} as const;

export type SiteConfig = typeof siteConfig;
