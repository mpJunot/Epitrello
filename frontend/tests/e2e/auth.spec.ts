import { test, expect } from '@playwright/test';

const hasCredentials = !!process.env.E2E_EMAIL && !!process.env.E2E_PASSWORD;

const selectors = {
  submit: 'Sign in',
};

const loginUrl = '/auth/login';

// Basic client-side validation (no backend required)
test('auth form requires credentials', async ({ page }) => {
  await page.goto(loginUrl);
  await page.getByRole('button', { name: selectors.submit }).click();

  await expect(page.getByText(/Email requis/)).toBeVisible();
  await expect(page.getByText(/Le mot de passe doit contenir au moins 8/)).toBeVisible();
});

// Full login flow (requires E2E_EMAIL / E2E_PASSWORD and backend available)
test.describe('auth login flow', () => {
  test.skip(!hasCredentials, 'Set E2E_EMAIL and E2E_PASSWORD to run the login flow');

  test('logs in and redirects to dashboard', async ({ page }) => {
    await page.goto(loginUrl);

    // Email field: use htmlFor label
    await page.getByLabel('Email address').fill(process.env.E2E_EMAIL || '');
    // Password field: use placeholder to avoid ambiguity with show/hide button
    await page.getByPlaceholder('••••••••').fill(process.env.E2E_PASSWORD || '');
    await page.getByRole('button', { name: selectors.submit }).click();

    await page.waitForURL('**/dashboard', { timeout: 20_000 });
    await expect(page).toHaveURL(/\/dashboard/);

    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();
  });
});
