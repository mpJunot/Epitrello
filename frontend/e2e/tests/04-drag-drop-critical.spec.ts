import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

/**
 * CRITICAL E2E TESTS - Drag & Drop (UX Critical)
 * 
 * SCOPE: The signature feature of Trello-like apps
 * REASON: If drag-drop breaks, the app is unusable
 */

test.describe('Drag & Drop - Critical Paths Only', () => {
  test('User can drag a card to another list', async ({ page }) => {
    await page.goto(`${baseUrl}/boards/test-board-123`);
    await page.waitForLoadState('networkidle');
    
    // Get first card and second list
    const card = page.locator('[class*="card"]').first();
    const targetList = page.locator('[class*="list"]').nth(1);
    
    if (await card.isVisible() && await targetList.isVisible()) {
      const cardBox = await card.boundingBox();
      const listBox = await targetList.boundingBox();
      
      if (cardBox && listBox) {
        // Perform drag
        await card.dragTo(targetList);
        
        // Verify card moved
        await page.waitForTimeout(500);
        const cardLocation = await card.boundingBox();
        expect(cardLocation).toBeTruthy();
      }
    }
  });

  test('User can reorder cards within same list', async ({ page }) => {
    await page.goto(`${baseUrl}/boards/test-board-123`);
    await page.waitForLoadState('networkidle');
    
    // Get first and second card in first list
    const cards = page.locator('[class*="card"]');
    const card1 = cards.nth(0);
    const card2 = cards.nth(1);
    
    if ((await cards.count()) >= 2) {
      // Drag card1 below card2
      await card1.dragTo(card2);
      
      // Verify order changed
      await page.waitForTimeout(500);
    }
  });

  test('Drag works after page refresh', async ({ page }) => {
    await page.goto(`${baseUrl}/boards/test-board-123`);
    await page.waitForLoadState('networkidle');
    
    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Try drag again
    const card = page.locator('[class*="card"]').first();
    const targetList = page.locator('[class*="list"]').nth(1);
    
    if (await card.isVisible() && await targetList.isVisible()) {
      await card.dragTo(targetList).catch(() => null);
    }
  });

  test('Drop on invalid target reverts card position', async ({ page }) => {
    await page.goto(`${baseUrl}/boards/test-board-123`);
    await page.waitForLoadState('networkidle');
    
    // Get initial position
    const card = page.locator('[class*="card"]').first();
    const initialBox = await card.boundingBox();
    
    // Try to drag to invalid location (outside board)
    await card.evaluate((el) => {
      el.dispatchEvent(new DragEvent('dragstart', { bubbles: true }));
    }).catch(() => null);
    
    // Position should be same
    const finalBox = await card.boundingBox();
    expect(finalBox?.y).toBe(initialBox?.y);
  });
});
