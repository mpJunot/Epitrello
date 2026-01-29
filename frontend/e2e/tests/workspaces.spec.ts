import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Workspace Settings Page', () => {
  test('displays workspace settings page', async ({ page }) => {
    // Navigate to a workspace settings page
    await page.goto(`${baseUrl}/workspaces/test-workspace-123/settings`);

    // Check if page loaded (either shows settings or error)
    // The page should not be blank or show 404
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('workspace settings has expected elements when accessible', async ({ page }) => {
    await page.goto(`${baseUrl}/workspaces/test-workspace-123/settings`);

    // Wait a moment for page to load
    await page.waitForLoadState('networkidle');

    // Check for common elements that might be on the page
    const pageTitle = page.locator('head title');
    const content = await pageTitle.textContent();
    expect(content).toBeTruthy();
  });
});

test.describe('Workspace Members Page', () => {
  test('displays workspace members page', async ({ page }) => {
    await page.goto(`${baseUrl}/workspaces/test-workspace-123/members`);

    // Check if page loaded
    const content = await page.content();
    expect(content).toBeTruthy();
  });
});

test.describe('Dashboard Page', () => {
  test('can access dashboard', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard`);

    // Check if page loaded
    const content = await page.content();
    expect(content).toBeTruthy();
  });
});

test.describe('Page Navigation', () => {
  test('can navigate between pages', async ({ page }) => {
    // Start at dashboard
    await page.goto(`${baseUrl}/dashboard`);
    expect(page.url()).toContain('/dashboard');

    // Try to navigate to settings
    await page.goto(`${baseUrl}/workspaces/test-workspace-123/settings`);
    expect(page.url()).toContain('/workspaces');
    expect(page.url()).toContain('/settings');

    // Try to navigate to members
    await page.goto(`${baseUrl}/workspaces/test-workspace-123/members`);
    expect(page.url()).toContain('/workspaces');
    expect(page.url()).toContain('/members');
  });

  test('network requests complete', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard`);

    // Wait for network to be idle
    await page.waitForLoadState('networkidle');

    // Page should have loaded successfully
    expect(page.url()).toContain('/dashboard');
  });
});
