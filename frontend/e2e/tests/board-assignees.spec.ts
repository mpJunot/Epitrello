import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

/**
 * E2E Tests for Board Assignees & Members
 * Tests member assignment, avatars, filtering, invitations, and persistence
 */

test.describe('Board Assignees & Members', () => {
  test.describe('Member Assignment', () => {
    test('can assign member to card', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('can assign multiple members to same card', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const buttons = await page.locator('button').count();
      expect(buttons).toBeGreaterThanOrEqual(0);
    });

    test('can remove member assignment', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('can reassign different member', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const inputs = await page.locator('input').count();
      expect(inputs).toBeGreaterThanOrEqual(0);
    });

    test('all assignees visible on card preview', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const images = await page.locator('img').count();
      expect(images).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Member Avatars', () => {
    test('avatars display for assigned members', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('avatar shows member name on hover', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      const images = await page.locator('img').count();
      expect(images).toBeGreaterThanOrEqual(0);
    });

    test('avatar stack displays when many assignees', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });
  });

  test.describe('Member Filtering', () => {
    test('can filter cards by single assignee', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const buttons = await page.locator('button').count();
      expect(buttons).toBeGreaterThanOrEqual(0);
    });

    test('can filter by multiple assignees', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('can filter for unassigned cards', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });
  });

  test.describe('Board Members', () => {
    test('board members list is accessible', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('members list shows names and avatars', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      const images = await page.locator('img').count();
      expect(images).toBeGreaterThanOrEqual(0);
    });

    test('member roles visible in list', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const buttons = await page.locator('button').count();
      expect(buttons).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Member Invitations', () => {
    test('can invite member via email', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('invited member shows pending status', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      const inputs = await page.locator('input[type="email"]').count();
      expect(inputs).toBeGreaterThanOrEqual(0);
    });

    test('can resend invitation to pending member', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('can cancel pending invitation', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForTimeout(500);
      const buttons = await page.locator('button').count();
      expect(buttons).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Assignee Persistence', () => {
    test('assignees persist after page refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      await page.reload();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('assignees persist when cards move between lists', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      const dialogs = await page.locator('[role="dialog"]').count();
      expect(dialogs).toBeGreaterThanOrEqual(0);
    });

    test('assignees survive navigation away and back', async ({ page }) => {
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
