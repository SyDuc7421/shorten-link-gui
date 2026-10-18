'use client';

import dynamic from 'next/dynamic';

/**
 * The account menu's "Admin" entry, loaded on demand. A static import of the
 * admin feature from the header would ship the whole admin UI to every visitor.
 */
export const AdminMenuEntry = dynamic(
  () => import('@/features/admin').then((module) => module.AdminMenuItem),
  { ssr: false },
);
