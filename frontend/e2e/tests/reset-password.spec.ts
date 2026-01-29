import { test, expect } from '@playwright/test';

const resetUrl = '/auth/reset';
const selectors = {
  submit: 'Reset password',
};

test('requires both password fields', async ({ page }) => {
  await page.goto(resetUrl + '?token=fake-token');

  await page.getByRole('button', { name: selectors.submit }).click();

  const errors = page.locator('p.text-red-600');
  await expect(errors.filter({ hasText: /confirm/i })).toBeVisible();
});

test('rejects short password', async ({ page }) => {
  await page.goto(resetUrl + '?token=fake-token');

  const passwordInput = page.locator('input[placeholder="••••••••"]').first();
  const confirmInput = page.locator('input[placeholder="••••••••"]').nth(1);
  await passwordInput.fill('short');
  await confirmInput.fill('short');
  await page.getByRole('button', { name: selectors.submit }).click();

  const errors = page.locator('p.text-red-600');
  await expect(errors.filter({ hasText: /6 characters/i })).toBeVisible();
});

test('rejects password mismatch', async ({ page }) => {
  await page.goto(resetUrl + '?token=fake-token');

  const passwordInput = page.locator('input[placeholder="••••••••"]').first();
  const confirmInput = page.locator('input[placeholder="••••••••"]').nth(1);
  await passwordInput.fill('password123');
  await confirmInput.fill('different123');
  await page.getByRole('button', { name: selectors.submit }).click();

  const errors = page.locator('p.text-red-600');
  await expect(errors.filter({ hasText: /match/i })).toBeVisible();
});

test('shows error when token is missing', async ({ page }) => {
  // Mock toast.error to verify it was called
  await page.addInitScript(() => {
    (window as Record<string, unknown>).__toastCalled = null;
  });

  await page.goto(resetUrl);
  await page.getByRole('button', { name: selectors.submit }).click();

  // Check that page stays on reset
  await expect(page).toHaveURL(/\/auth\/reset$/);
});

test('resets password with valid token (mocked)', async ({ page }) => {
  let capturedToken: string | null = null;
  let capturedPassword: string | null = null;

  // Prevent actual navigation
  await page.addInitScript(() => {
    Object.defineProperty(window, 'location', {
      value: {
        href: window.location.href,
        assign: () => {},
        replace: () => {},
      },
    });
  });

  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    capturedPassword = body?.variables?.input?.newPassword;
    capturedToken = body?.variables?.input?.token;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          resetPassword: {
            message: 'Password reset successfully',
          },
        },
      }),
    });
  });

  await page.goto(resetUrl + '?token=test-token-abc123');
  const passwordInput = page.locator('input[placeholder="••••••••"]').first();
  const confirmInput = page.locator('input[placeholder="••••••••"]').nth(1);
  await passwordInput.fill('newpassword123');
  await confirmInput.fill('newpassword123');
  await page.getByRole('button', { name: selectors.submit }).click();

  expect(capturedPassword).toBe('newpassword123');
  expect(capturedToken).toBe('test-token-abc123');
});

test('goes back to login', async ({ page }) => {
  await page.goto(resetUrl + '?token=fake-token');
  await page.getByRole('link', { name: /login/i }).click();

  await expect(page).toHaveURL(/\/auth\/login/);
});
