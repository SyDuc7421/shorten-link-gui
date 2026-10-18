import type { Page, Route } from '@playwright/test';

const ADMIN = { id: '7311234567890123456', email: 'admin@example.com', role: 'admin' };
const OWNER = { id: '7311234567890123457', email: 'owner@example.com', disabled_at: null };

export const ADMIN_ROUTES = [
  '/admin',
  '/admin/users',
  `/admin/users/${OWNER.id}`,
  '/admin/links',
  '/admin/audit',
];

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

/** A stored session, so the app treats the browser as signed in. */
export async function signInAsAdmin(page: Page) {
  await page.addInitScript((email) => {
    window.localStorage.setItem(
      'shortlink-session',
      JSON.stringify({
        state: { accessToken: 'e2e-access', refreshToken: 'e2e-refresh', email },
        version: 0,
      }),
    );
  }, ADMIN.email);
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    headers: CORS,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

/** Answers every /api/admin request from memory; writes change later reads. */
export async function mockAdminApi(page: Page, { isAdmin = true } = {}) {
  const links = [
    {
      id: '7311234567890123458',
      code: 'abc',
      short_url: 'http://localhost:8080/abc',
      original_url: 'https://example.com/landing',
      clicks: 12,
      owner: OWNER,
      disabled_at: null as string | null,
      expires_at: null,
      created_at: '2026-10-01T00:00:00Z',
    },
  ];
  const user = {
    id: OWNER.id,
    email: OWNER.email,
    role: 'user',
    quota_daily: 50,
    disabled_at: null,
    created_at: '2026-09-01T00:00:00Z',
    link_count: links.length,
  };
  const daily = Array.from({ length: 30 }, (_, index) => ({
    date: new Date(Date.UTC(2026, 8, 19 + index)).toISOString().slice(0, 10),
    new_users: index % 3,
    new_links: index % 4,
    clicks: index * 5,
  }));

  await page.route('**/api/admin/**', async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });

    const url = new URL(request.url());
    const path = url.pathname;

    if (!isAdmin) return json(route, { error: 'forbidden' }, 403);
    if (path === '/api/admin/me') return json(route, ADMIN);
    if (path === '/api/admin/stats') {
      return json(route, {
        totals: { users: 2, links: 1, clicks: 12, disabled_users: 0, disabled_links: 0 },
        daily,
        top_links: [{ code: 'abc', clicks: 12 }],
      });
    }
    if (path === '/api/admin/users') return json(route, { users: [user], next_cursor: '' });
    if (path === `/api/admin/users/${OWNER.id}`) {
      return json(route, { ...user, links_today: 0, total_clicks: 12 });
    }
    if (path === '/api/admin/audit') {
      return json(route, {
        entries: [
          {
            id: '1',
            actor: { id: ADMIN.id, email: ADMIN.email },
            action: 'user.quota',
            resource_type: 'user',
            resource_id: OWNER.id,
            metadata: { before: 50, after: 20, reason: 'Too many links' },
            created_at: '2026-10-18T09:00:00Z',
          },
        ],
        next_cursor: '',
      });
    }
    if (path === '/api/admin/links') {
      const status = url.searchParams.get('status');
      const matches = links.filter((link) => {
        if (status === 'active') return link.disabled_at === null;
        if (status === 'disabled') return link.disabled_at !== null;
        return status !== 'expired';
      });
      return json(route, { links: matches, next_cursor: '' });
    }
    const toggle = path.match(/^\/api\/admin\/links\/([^/]+)\/(disable|enable)$/);
    if (toggle) {
      const link = links.find((item) => item.code === toggle[1]);
      if (!link) return json(route, { error: 'not found' }, 404);
      link.disabled_at = toggle[2] === 'disable' ? '2026-10-18T10:00:00Z' : null;
      return json(route, link);
    }
    return json(route, { error: `not mocked: ${request.method()} ${path}` }, 500);
  });
}
