import { expect, test } from '@playwright/test';

import { mockAdminApi, signInAsAdmin } from './fixtures/admin-api';

test('an admin disables a link and it moves from the active filter to the disabled one', async ({
  page,
}) => {
  await signInAsAdmin(page);
  await mockAdminApi(page);
  await page.goto('/admin/links?status=active');

  const row = page.getByRole('row').filter({ hasText: 'abc' });
  await expect(row).toBeVisible();

  await row.getByRole('button', { name: 'Disable', exact: true }).click();
  const dialog = page.getByRole('alertdialog');
  await dialog.getByLabel('Reason (optional)').fill('Phishing page');
  await dialog.getByRole('button', { name: 'Disable link' }).click();

  await expect(page.getByText('Link disabled')).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'abc' })).toHaveCount(0);

  await page.getByRole('combobox', { name: 'Status' }).click();
  await page.getByRole('option', { name: 'Disabled' }).click();

  await expect(page).toHaveURL(/status=disabled/);
  const disabledRow = page.getByRole('row').filter({ hasText: 'abc' });
  await expect(disabledRow.getByText('Disabled', { exact: true })).toBeVisible();
});

test('a signed-in non-admin sees a permission state, not the admin area', async ({ page }) => {
  await signInAsAdmin(page);
  await mockAdminApi(page, { isAdmin: false });
  await page.goto('/admin');

  await expect(page.getByText('Only admins can open this area')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Admin sections' })).toHaveCount(0);
});

test('a signed-out visitor is sent to sign in', async ({ page }) => {
  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/login$/);
});
