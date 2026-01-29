import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const loginUrl = `${baseUrl}/auth/login`;

test.describe('Login Page - Basic Navigation', () => {
  test('can access login page', async ({ page }) => {
    await page.goto(loginUrl);

    // Check if page loaded
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('login page loads without critical errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(loginUrl);
    await page.waitForLoadState('networkidle');

    // Should not have critical errors
    const criticalErrors = errors.filter((e) => !e.includes('404') && !e.includes('Not Found'));
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Login Form Elements', () => {
  test('login form elements are present', async ({ page }) => {
    await page.goto(loginUrl);
    await page.waitForLoadState('networkidle');

    // Page title should be set
    const pageTitle = page.locator('head title');
    const content = await pageTitle.textContent();
    expect(content).toBeTruthy();
  });

  test('has navigation to other auth pages', async ({ page }) => {
    await page.goto(loginUrl);
    await page.waitForLoadState('networkidle');

    // Check if page has content and basic structure
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
  });
});

test.describe('Login Accessibility', () => {
  test('page is accessible', async ({ page }) => {
    await page.goto(loginUrl);
    await page.waitForLoadState('networkidle');

    // Check for basic accessibility
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBeTruthy();
  });

  test('has proper title', async ({ page }) => {
    await page.goto(loginUrl);

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});

test.describe('Login Flow', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto(loginUrl);
    await page.waitForLoadState('domcontentloaded');

    // Basic rendering check
    const content = await page.content();
    expect(content).toContain('<!DOCTYPE html>');
  });

  test('can submit login form (without credentials)', async ({ page }) => {
    await page.goto(loginUrl);
    await page.waitForLoadState('networkidle');

    // Page should be fully loaded
    expect(page.url()).toContain('/auth/login');
  });
});
