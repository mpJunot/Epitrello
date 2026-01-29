import { test, expect } from '@playwright/test';

const callbackUrl = '/auth/callback';

test('shows error message when error param present', async ({ page }) => {
  const errorMsg = 'OAuth provider rejected the request';
  const encodedError = encodeURIComponent(errorMsg);

  await page.goto(`${callbackUrl}?error=${encodedError}`);

  await expect(page.getByText(errorMsg)).toBeVisible();
});

test('shows no token error when callback has no token', async ({ page }) => {
  await page.goto(callbackUrl);

  await expect(page.getByText(/No token found/i)).toBeVisible();
});

test('exchanges token for session on success (mocked)', async ({ page }) => {
  let payload: Record<string, unknown> | null = null;

  await page.route('**/api/auth/exchange', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto(`${callbackUrl}?token=oauth-token-xyz`);

  // Wait for exchange to be called
  await expect.poll(
    async () => {
      const hasExchangeBeenCalled = payload !== null;
      return hasExchangeBeenCalled;
    },
    { timeout: 5000 }
  ).toBe(true);

  expect(payload?.token).toBe('oauth-token-xyz');
});

test('shows error when exchange fails', async ({ page }) => {
  await page.route('**/api/auth/exchange', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Token expired' }),
    });
  });

  await page.goto(`${callbackUrl}?token=expired-token`);

  await expect(page.getByText(/Token expired/i)).toBeVisible();
});

test('shows processing message during exchange', async ({ page }) => {
  await page.route('**/api/auth/exchange', async (route) => {
    // Delay to show the processing message
    await new Promise(resolve => setTimeout(resolve, 100));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto(`${callbackUrl}?token=valid-token`);

  // Should see processing message at some point
  const content = page.locator('.max-w-md');
  await expect(content).toContainText(/redirection|finalisation|authentification/i);
});
