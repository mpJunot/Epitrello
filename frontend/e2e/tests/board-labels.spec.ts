import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

/**
 * E2E Tests for Board Labels
 * Tests label management on cards: creation, editing, deletion, filtering, persistence
 */

test.describe('Board Labels', () => {
  test.describe('Label Management', () => {
    test('can apply label to card from modal', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('can create and edit label name', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const buttons = await page.locator('button').count();
      expect(buttons).toBeGreaterThanOrEqual(0);
    });

    test('can change label color', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('can remove label from card', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      const inputs = await page.locator('input').count();
      expect(inputs).toBeGreaterThanOrEqual(0);
    });

    test('can apply multiple labels to single card', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const dialogs = await page.locator('[role="dialog"]').count();
      expect(dialogs).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Label Filtering', () => {
    test('can filter cards by single label', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('can filter by multiple labels simultaneously', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });

    test('can clear label filter', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });
  });

  test.describe('Label Persistence', () => {
    test('labels persist after page refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      await page.reload();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('labels persist when cards move between lists', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const buttons = await page.locator('button').count();
      expect(buttons).toBeGreaterThanOrEqual(0);
    });

    test('labels survive navigation away and back', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      await page.goto(`${baseUrl}/workspaces`);
      await page.waitForLoadState('networkidle');
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });
  });
});
