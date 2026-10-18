import { expect, test, type Page } from '@playwright/test';

import { ADMIN_ROUTES, mockAdminApi, signInAsAdmin } from './fixtures/admin-api';

/**
 * The supported range. Horizontal overflow at any of these widths is a bug —
 * see DESIGN.md §8.3 for the usual causes.
 */
const VIEWPORTS = [
  { name: 'mobile', width: 360, height: 640 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

/** Routes to check. Add every page that ships. */
const ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password', ...ADMIN_ROUTES];

async function open(page: Page, route: string) {
  if (ADMIN_ROUTES.includes(route)) {
    await signInAsAdmin(page);
    await mockAdminApi(page);
  }
  await page.goto(route);
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    if (root.scrollWidth <= root.clientWidth) return null;

    // Name the widest offender so the failure is actionable.
    let worst: { selector: string; right: number } | null = null;
    for (const element of document.querySelectorAll<HTMLElement>('body *')) {
      const right = element.getBoundingClientRect().right;
      if (right > root.clientWidth + 1 && (!worst || right > worst.right)) {
        const id = element.id ? `#${element.id}` : '';
        const cls = element.className?.toString().split(' ').slice(0, 3).join('.');
        worst = { selector: `${element.tagName.toLowerCase()}${id}${cls ? '.' + cls : ''}`, right };
      }
    }
    return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, worst };
  });
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of ROUTES) {
      test(`${route} does not scroll horizontally`, async ({ page }) => {
        await open(page, route);
        await page.waitForLoadState('networkidle');

        expect(
          await horizontalOverflow(page),
          'horizontal overflow — see DESIGN.md §8.3',
        ).toBeNull();
      });

      test(`${route} keeps tap targets large enough`, async ({ page }) => {
        test.skip(viewport.width >= 768, 'Touch target minimum applies below md.');

        await open(page, route);
        const small: string[] = [];

        for (const target of await page.getByRole('button').all()) {
          const box = await target.boundingBox();
          if (box && (box.width < 44 || box.height < 44)) {
            small.push(
              `${(await target.textContent())?.trim() || '<icon>'} ${box.width}x${box.height}`,
            );
          }
        }

        expect(small, 'tap targets below 44px — see DESIGN.md §8.5').toEqual([]);
      });
    }
  });
}
