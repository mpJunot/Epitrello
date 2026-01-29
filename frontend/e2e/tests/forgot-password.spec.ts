import { test, expect } from '@playwright/test';

const forgotUrl = '/auth/forgot';
const selectors = {
  submit: 'Send link',
};

test('shows form with email input', async ({ page }) => {
  await page.goto(forgotUrl);

  await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  await expect(page.getByRole('button', { name: selectors.submit })).toBeVisible();
  await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
});

test('requires email field', async ({ page }) => {
  await page.goto(forgotUrl);

  const input = page.locator('input[type="email"]');
  await expect(input).toHaveAttribute('required', '');
});

test('shows backend error message', async ({ page }) => {
  await page.route('**/graphql', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        errors: [{ message: 'Email not found' }],
      }),
    });
  });

  await page.goto(forgotUrl);
  await page.getByPlaceholder('you@example.com').fill('notexist@example.com');
  await page.getByRole('button', { name: selectors.submit }).click();

  await expect(page.getByText(/Email not found/i)).toBeVisible();
});

test('shows success message when email sent (mocked)', async ({ page }) => {
  let payload: any = null;

  await page.route('**/graphql', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          forgotPassword: {
            message: 'Reset link sent to your email',
          },
        },
      }),
    });
  });

  await page.goto(forgotUrl);
  await page.getByPlaceholder('you@example.com').fill('user@example.com');
  await page.getByRole('button', { name: selectors.submit }).click();

  await expect(page.getByText(/Reset link sent to your email/i)).toBeVisible();
  expect(payload?.variables?.input?.email).toBe('user@example.com');
});

test('goes back to login', async ({ page }) => {
  await page.goto(forgotUrl);
  await page.getByRole('link', { name: /login/i }).click();

  await expect(page).toHaveURL(/\/auth\/login/);
});
