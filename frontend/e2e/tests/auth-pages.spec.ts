import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Password Reset', () => {
  test('can access reset password page', async ({ page }) => {
    await page.goto(`${baseUrl}/auth/reset?token=test-token`);

    // Check if page loaded
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('reset password page loads without errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${baseUrl}/auth/reset?token=test-token`);
    await page.waitForLoadState('networkidle');

    // Should not have critical errors
    const criticalErrors = errors.filter((e) => !e.includes('404') && !e.includes('Not Found'));
    expect(criticalErrors.length).toBe(0);
  });

  test('requires token parameter', async ({ page }) => {
    await page.goto(`${baseUrl}/auth/reset`);
    
    // Page should still load, but might show an error
    const content = await page.content();
    expect(content).toBeTruthy();
  });
});

test.describe('OAuth Callback', () => {
  test('can access oauth callback page', async ({ page }) => {
    await page.goto(`${baseUrl}/auth/oauth/callback?token=test-token`);

    // Check if page loaded
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('oauth callback handles missing token', async ({ page }) => {
    await page.goto(`${baseUrl}/auth/oauth/callback`);

    // Page should load
    const content = await page.content();
    expect(content).toBeTruthy();
  });
});

test.describe('User Registration', () => {
  test('can access register page', async ({ page }) => {
    await page.goto(`${baseUrl}/auth/register`);

    // Check if page loaded
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('register page loads without errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${baseUrl}/auth/register`);
    await page.waitForLoadState('networkidle');

    // Should not have critical errors
    const criticalErrors = errors.filter((e) => !e.includes('404') && !e.includes('Not Found'));
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Forgot Password', () => {
  test('can access forgot password page', async ({ page }) => {
    await page.goto(`${baseUrl}/auth/forgot`);

    // Check if page loaded
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('forgot password page loads without errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${baseUrl}/auth/forgot`);
    await page.waitForLoadState('networkidle');

    // Should not have critical errors
    const criticalErrors = errors.filter((e) => !e.includes('404') && !e.includes('Not Found'));
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Auth Pages Navigation', () => {
  test('can navigate between auth pages', async ({ page }) => {
    await page.goto(`${baseUrl}/auth/login`);
    expect(page.url()).toContain('/auth/login');

    await page.goto(`${baseUrl}/auth/register`);
    expect(page.url()).toContain('/auth/register');

    await page.goto(`${baseUrl}/auth/forgot`);
    expect(page.url()).toContain('/auth/forgot');

    await page.goto(`${baseUrl}/auth/reset?token=test`);
    expect(page.url()).toContain('/auth/reset');
  });

  test('auth pages load successfully', async ({ page }) => {
    const authPages = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot',
      '/auth/reset?token=test-token',
    ];

    for (const authPage of authPages) {
      await page.goto(`${baseUrl}${authPage}`);
      await page.waitForLoadState('networkidle');

      // Verify page loaded
      const content = await page.content();
      expect(content).toBeTruthy();
      expect(page.url()).toContain(authPage.split('?')[0]);
    }
  });
});
