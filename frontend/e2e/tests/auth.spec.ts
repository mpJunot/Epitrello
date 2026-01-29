import { test, expect } from '@playwright/test';

const hasCredentials = !!process.env.E2E_EMAIL && !!process.env.E2E_PASSWORD;

const selectors = {
  submit: 'Sign in',
};

const loginUrl = '/auth/login';

// Basic client-side validation (no backend required)
test('requires credentials', async ({ page }) => {
  await page.goto(loginUrl);
  await page.getByRole('button', { name: selectors.submit }).click();

  await expect(page.getByText(/Email required|Email requis/i)).toBeVisible();
  await expect(page.getByText(/Password must contain at least 8|mot de passe doit contenir/i)).toBeVisible();
});

test('rejects short password', async ({ page }) => {
  await page.goto(loginUrl);

  await page.getByLabel('Email address').fill('user@example.com');
  await page.getByPlaceholder('••••••••').fill('short');
  await page.getByRole('button', { name: selectors.submit }).click();

  const errorMessages = page.locator('p.text-red-600');
  await expect(errorMessages).toContainText(/Password must contain at least 8|mot de passe doit contenir/i);
});

test('remember me toggle', async ({ page }) => {
  await page.goto(loginUrl);

  const rememberCheckbox = page.getByRole('checkbox', { name: /remember me/i });
  await expect(rememberCheckbox).not.toBeChecked();

  await rememberCheckbox.check();
  await expect(rememberCheckbox).toBeChecked();
});

test('show/hide password', async ({ page }) => {
  await page.goto(loginUrl);

  const passwordInput = page.locator('input#password');
  await expect(passwordInput).toHaveAttribute('type', 'password');

  await page.getByRole('button', { name: /show password|show/i }).click();
  await expect(passwordInput).toHaveAttribute('type', 'text');

  await page.getByRole('button', { name: /hide password|hide/i }).click();
  await expect(passwordInput).toHaveAttribute('type', 'password');
});

test('goes to forgot password', async ({ page }) => {
  await page.goto(loginUrl);
  await page.getByRole('link', { name: /forgot password/i }).click();
  await page.waitForURL('**/auth/forgot');
  await expect(page).toHaveURL(/\/auth\/forgot/);
});

test('social buttons use backend URLs', async ({ page }) => {
  const expectedBackendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql').replace(/\/graphql\/?$/, '');

  const captureProvider = async (provider: 'google' | 'microsoft') => {
    const urls: string[] = [];
    await page.route(`**/auth/${provider}`, async (route) => {
      urls.push(route.request().url());
      await route.abort();
    });

    await page.goto(loginUrl);
    await page.getByRole('button', { name: new RegExp(provider, 'i') }).click();
    expect(urls.pop()).toBe(`${expectedBackendBase}/auth/${provider}`);

    await page.unroute(`**/auth/${provider}`);
  };

  await captureProvider('google');
  await captureProvider('microsoft');
});

test.describe('backend responses', () => {
  test('shows GraphQL error', async ({ page }) => {
    await page.route('**/graphql', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ errors: [{ message: 'Invalid credentials' }] }),
      });
    });

    await page.goto(loginUrl);
    await page.getByLabel('Email address').fill('user@example.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: selectors.submit }).click();

    await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
  });

  test('shows HTTP error', async ({ page }) => {
    await page.route('**/graphql', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Internal error',
      });
    });

    await page.goto(loginUrl);
    await page.getByLabel('Email address').fill('user@example.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: selectors.submit }).click();

    await expect(page.getByText(/Internal error|Erreur réseau/i)).toBeVisible();
  });

  test('stores token on success (mocked)', async ({ page }) => {
    let capturedRememberMe: boolean | string | null = null;
    let requestSeen = false;

    await page.route('**/graphql', async (route) => {
      const raw = route.request().postData() || '{}';
      const body = JSON.parse(raw) as { variables?: { input?: { rememberMe?: boolean } } };
      capturedRememberMe = body?.variables?.input?.rememberMe ?? null;
      requestSeen = true;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            login: {
              token: 'test-token',
              user: { id: '1', email: 'user@example.com', name: 'User', avatar: null, createdAt: '', updatedAt: '' },
            },
          },
        }),
      });
    });

    await page.goto(loginUrl);
    await page.getByLabel('Email address').fill('user@example.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('checkbox', { name: /remember me/i }).check();
    await page.getByRole('button', { name: selectors.submit }).click();

    // Navigation may occur after login; wait until token is stored, resilient across navigations
    await page.waitForFunction(() => localStorage.getItem('auth_token') === 'test-token', null, { timeout: 10000 });
    expect(requestSeen).toBe(true);
  });
});

// Full login flow (requires E2E_EMAIL / E2E_PASSWORD and backend available)
test.describe('auth login flow', () => {
  test.skip(!hasCredentials, 'Set E2E_EMAIL and E2E_PASSWORD to run the login flow');

  test('logs in with real backend', async ({ page }) => {
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
