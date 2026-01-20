import { test, expect } from '@playwright/test';

const registerUrl = '/auth/register';
const selectors = {
  submit: 'Create account',
};

test('requires all fields', async ({ page }) => {
  await page.goto(registerUrl);
  await page.getByRole('button', { name: selectors.submit }).click();

  await expect(page.getByText(/Name required/i)).toBeVisible();
  await expect(page.getByText(/Email required/i)).toBeVisible();
  await expect(page.getByText(/Password must contain at least 8/i)).toBeVisible();
  await expect(page.getByText(/Please confirm password/i)).toBeVisible();
});

test('rejects password mismatch', async ({ page }) => {
  await page.goto(registerUrl);

  await page.getByPlaceholder('John Doe').fill('Jane Doe');
  await page.getByPlaceholder('you@example.com').fill('jane@example.com');
  const passwordInput = page.locator('input[placeholder="••••••••"]').first();
  const confirmInput = page.locator('input[placeholder="••••••••"]').nth(1);
  await passwordInput.fill('password123');
  await confirmInput.fill('different123');
  await page.getByRole('button', { name: selectors.submit }).click();

  const errors = page.locator('p.text-red-600');
  await expect(errors.filter({ hasText: /match/i })).toBeVisible();
});

test('rejects short password', async ({ page }) => {
  await page.goto(registerUrl);

  await page.getByPlaceholder('John Doe').fill('Jane Doe');
  await page.getByPlaceholder('you@example.com').fill('jane@example.com');
  const passwordInput = page.locator('input[placeholder="••••••••"]').first();
  const confirmInput = page.locator('input[placeholder="••••••••"]').nth(1);
  await passwordInput.fill('short');
  await confirmInput.fill('short');
  await page.getByRole('button', { name: selectors.submit }).click();

  await expect(page.getByText(/Password must contain at least 8/i)).toBeVisible();
});

test('creates account and redirects on success (mocked)', async ({ page }) => {
  let payload: any = null;

  await page.route('**/graphql', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          register: {
            token: 'fake-token',
            user: {
              id: 'u1',
              email: 'new@example.com',
              name: 'New User',
              avatar: null,
              createdAt: '',
              updatedAt: '',
            },
          },
        },
      }),
    });
  });

  await page.goto(registerUrl);
  await page.getByPlaceholder('John Doe').fill('Jane Doe');
  await page.getByPlaceholder('My shop').fill('My Shop');
  await page.getByPlaceholder('you@example.com').fill('jane@example.com');
  const passwordInput = page.locator('input[placeholder="••••••••"]').first();
  const confirmInput = page.locator('input[placeholder="••••••••"]').nth(1);
  await passwordInput.fill('password123');
  await confirmInput.fill('password123');
  await page.getByRole('button', { name: selectors.submit }).click();

  await page.waitForURL('**/auth/register/success');
  await expect(page).toHaveURL(/\/auth\/register\/success/);
  await expect.poll(async () => await page.evaluate(() => localStorage.getItem('token'))).toBe('fake-token');

  expect(payload?.variables?.input?.name).toBe('Jane Doe');
  expect(payload?.variables?.input?.email).toBe('jane@example.com');
  expect(payload?.variables?.input?.companyName).toBe('My Shop');
});

test('keeps user on page when backend fails (mocked)', async ({ page }) => {
  await page.route('**/graphql', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ errors: [{ message: 'Email already used' }] }),
    });
  });

  await page.goto(registerUrl);
  await page.getByPlaceholder('John Doe').fill('Jane Doe');
  await page.getByPlaceholder('you@example.com').fill('jane@example.com');
  const passwordInput = page.locator('input[placeholder="••••••••"]').first();
  const confirmInput = page.locator('input[placeholder="••••••••"]').nth(1);
  await passwordInput.fill('password123');
  await confirmInput.fill('password123');
  await page.getByRole('button', { name: selectors.submit }).click();

  await expect(page).toHaveURL(/\/auth\/register$/);
  await expect.poll(async () => await page.evaluate(() => localStorage.getItem('token'))).toBe(null);
});
