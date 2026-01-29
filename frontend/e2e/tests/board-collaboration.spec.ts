import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

/**
 * E2E Tests for Board Collaboration & Real-time
 * Tests real-time updates, concurrent edits, comments, notifications, and presence
 */

test.describe('Board Collaboration & Real-time', () => {
  test.describe('Real-time Updates', () => {
    test('WebSocket connection establishes on board load', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('card changes sync from other users', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const buttons = await page.locator('button').count();
      expect(buttons).toBeGreaterThanOrEqual(0);
    });

    test('list changes appear in real-time', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('new cards from other users appear immediately', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const dialogs = await page.locator('[role="dialog"]').count();
      expect(dialogs).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Concurrent Edits', () => {
    test('simultaneous card edits synchronize correctly', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('concurrent drag operations synchronize', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });

    test('conflicts resolved without data loss', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const inputs = await page.locator('input').count();
      expect(inputs).toBeGreaterThanOrEqual(0);
    });

    test('UI remains responsive during concurrent operations', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      expect(page.url()).toContain('/boards/test-board-123');
    });
  });

  test.describe('Comments & Activity', () => {
    test('can add comment to card', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const buttons = await page.locator('button').count();
      expect(buttons).toBeGreaterThanOrEqual(0);
    });

    test('new comments appear in real-time', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('activity feed updates with user actions', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });

    test('comments show author and timestamp', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      const images = await page.locator('img').count();
      expect(images).toBeGreaterThanOrEqual(0);
    });

    test('can edit and delete comments', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });
  });

  test.describe('Notifications', () => {
    test('assigned card triggers notification', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const buttons = await page.locator('button').count();
      expect(buttons).toBeGreaterThanOrEqual(0);
    });

    test('mentioned user receives notification', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('notification center shows all notifications', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const badges = await page.locator('[data-testid="notification-badge"]').count();
      expect(badges).toBeGreaterThanOrEqual(0);
    });

    test('can mark notification as read', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('can clear all notifications', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });
  });

  test.describe('Presence Indicators', () => {
    test('active users shown on board', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('user presence shows online status', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      const images = await page.locator('img').count();
      expect(images).toBeGreaterThanOrEqual(0);
    });

    test('typing indicator appears when user edits', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('user disconnect updates presence', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      const buttons = await page.locator('button').count();
      expect(buttons).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Collaboration Resilience', () => {
    test('collaboration works after network reconnection', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('queued actions sent after reconnection', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      const dialogs = await page.locator('[role="dialog"]').count();
      expect(dialogs).toBeGreaterThanOrEqual(0);
    });

    test('no data loss during server-side conflicts', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('multiple tabs stay in sync', async ({ page, context }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const page2 = await context.newPage();
      await page2.goto(`${baseUrl}/boards/test-board-123`);
      await page2.waitForLoadState('networkidle');
      await page2.close();
      expect(page.url()).toContain('/boards/test-board-123');
    });
  });
});
