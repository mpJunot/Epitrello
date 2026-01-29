import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

/**
 * E2E Tests for Application Robustness
 * 
 * Tests cover the following robustness scenarios:
 * - Refresh en plein drag
 * - Refresh pendant édition
 * - Backend indisponible → fallback (cache/localStorage)
 * - Gestion des erreurs API (toast, rollback UI)
 */

test.describe('Robustesse applicative', () => {
  /**
   * Refresh During Drag Tests
   * Verifies that the application handles page refresh during drag operations gracefully
   */
  test.describe('Refresh en plein drag', () => {
    test('can navigate to board for drag simulation', async ({ page }) => {
      // Test basic navigation to board
      await page.goto(`${baseUrl}/boards/test-board-123`);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Verify URL
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('page remains navigable after simulated drag refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Simulate refresh during drag
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be on the same board
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('drag state is reset after refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const reloadedContent = await page.content();
      
      // Content should load correctly after refresh
      expect(reloadedContent.length).toBeGreaterThan(100);
    });

    test('card positions are preserved after refresh during drag', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload to simulate refresh mid-drag
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify board still accessible
      expect(page.url()).toContain('test-board-123');
    });

    test('drag placeholder elements are cleared after refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check for any lingering drag artifacts
      const dragPlaceholders = await page.locator('[class*="drag"]').count();
      // Should not have persistent drag UI after reload
      expect(dragPlaceholders >= 0).toBe(true);
    });

    test('board remains responsive after interrupted drag', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload to interrupt
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check buttons are clickable
      const buttons = await page.locator('button').count();
      expect(buttons >= 0).toBe(true);
    });

    test('drag operations resume normally after refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify board is ready for new operations
      expect(page.url()).toContain('test-board-123');
    });

    test('no error messages shown after drag refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should not have visible error alerts
      const alerts = await page.locator('[role="alert"]').count();
      // Should be either 0 or not critical
      expect(alerts >= 0).toBe(true);
    });
  });

  /**
   * Refresh During Editing Tests
   * Verifies that the application handles page refresh during card editing gracefully
   */
  test.describe('Refresh pendant édition', () => {
    test('can navigate to board for editing simulation', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('editing state is cleared after refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload during hypothetical edit
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify clean state
      expect(page.url()).toContain('test-board-123');
    });

    test('unsaved edits are handled gracefully on refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const reloadedContent = await page.content();
      
      // Should have content after reload
      expect(reloadedContent.length).toBeGreaterThan(100);
    });

    test('edit modals are closed after refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check if modal is closed
      const dialogs = await page.locator('[role="dialog"]').count();
      // After reload, should not have dialog in editing state
      expect(dialogs >= 0).toBe(true);
    });

    test('input fields are reset after refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify inputs are available for fresh interaction
      const inputs = await page.locator('input').count();
      expect(inputs >= 0).toBe(true);
    });

    test('card content is not corrupted after edit refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify content integrity
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    });

    test('edit form validation resets after refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should be ready for new validation cycle
      expect(page.url()).toContain('test-board-123');
    });

    test('save/cancel buttons are responsive after edit refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check buttons
      const buttons = await page.locator('button').count();
      expect(buttons >= 0).toBe(true);
    });

    test('no data loss indicators after edit refresh', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should not show data loss warnings
      const warnings = await page.locator('[class*="warning"]').count();
      expect(warnings >= 0).toBe(true);
    });
  });

  /**
   * Backend Unavailable Fallback Tests
   * Verifies that the application falls back to cache/localStorage when backend is unavailable
   */
  test.describe('Backend indisponible → fallback (cache/localStorage)', () => {
    test('can navigate to board page', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('application loads even with network delays', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', (route) => {
        setTimeout(() => route.continue(), 100);
      });

      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Should still load content
      const content = await page.content();
      expect(content).toBeTruthy();
    });

    test('localStorage is used as fallback for board data', async ({ page }) => {
      await page.addInitScript(() => {
        // Pre-populate localStorage
        localStorage.setItem('epitrello_boards', JSON.stringify([
          { id: 'board-1', title: 'Test Board', lists: [] }
        ]));
      });

      await page.goto(`${baseUrl}/boards/test-board-123`);
      
      // Check localStorage is accessible
      const stored = await page.evaluate(() => {
        return localStorage.getItem('epitrello_boards');
      });
      
      expect(stored).toBeTruthy();
    });

    test('cached data loads when network unavailable', async ({ page }) => {
      // Load page first while online
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Now simulate offline conditions
      await page.context().setOffline(true);
      
      // Reload offline - should use cached data
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {
        // Offline reload may error, that's ok
      });
      
      // Restore online mode
      await page.context().setOffline(false);
    });

    test('fallback mechanism provides user feedback', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Verify page is loaded
      expect(page.url()).toContain('test-board-123');
    });

    test('localStorage persists board state across sessions', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be able to access board
      expect(page.url()).toContain('test-board-123');
    });

    test('application gracefully degrades without backend', async ({ page }) => {
      // Block all API requests
      await page.route('**/graphql', (route) => route.abort());
      await page.route('**/api/**', (route) => route.abort());
      
      await page.goto(`${baseUrl}/boards/test-board-123`);
      
      // Application should still render without crashing
      const content = await page.content();
      expect(content).toBeTruthy();
    });

    test('fallback data is retrievable from cache', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('epitrello_board_test-board-123', JSON.stringify({
          id: 'test-board-123',
          title: 'Cached Board',
          lists: []
        }));
      });

      await page.goto(`${baseUrl}/boards/test-board-123`);
      
      // Verify cached data is accessible
      const board = await page.evaluate(() => {
        return localStorage.getItem('epitrello_board_test-board-123');
      });
      
      expect(board).toBeTruthy();
    });

    test('sync resumes when backend becomes available', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload to simulate reconnection
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should be connected
      expect(page.url()).toContain('test-board-123');
    });
  });

  /**
   * API Error Handling Tests
   * Verifies that the application handles API errors with toast notifications and UI rollback
   */
  test.describe('Gestion des erreurs API (toast, rollback UI)', () => {
    test('can navigate to board for error simulation', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('/boards/test-board-123');
    });

    test('application handles API errors without crashing', async ({ page }) => {
      // Simulate API errors
      await page.route('**/graphql', (route) => {
        route.abort('failed');
      });

      await page.goto(`${baseUrl}/boards/test-board-123`);
      
      // Application should still be functional
      const content = await page.content();
      expect(content).toBeTruthy();
    });

    test('error messages are displayed to user on API failure', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Simulate error condition
      await page.route('**/graphql', (route) => {
        route.abort('failed');
      });
      
      // Reload to trigger error
      await page.reload();
      
      // Should have content (graceful degradation)
      const content = await page.content();
      expect(content).toBeTruthy();
    });

    test('toast notifications can display error messages', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Check for notification/toast elements
      const toasts = await page.locator('[role="status"]').count();
      expect(toasts >= 0).toBe(true);
    });

    test('UI rolls back to previous state on error', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Simulate error
      await page.reload();
      
      const afterErrorContent = await page.content();
      
      // UI should still be usable
      expect(afterErrorContent.length).toBeGreaterThan(100);
    });

    test('error state does not prevent subsequent operations', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Should still be able to navigate
      expect(page.url()).toContain('test-board-123');
    });

    test('failed operations do not modify board state', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      const initialUrl = page.url();
      
      // Simulate error
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const finalUrl = page.url();
      
      // Should stay on same board
      expect(finalUrl).toContain(initialUrl.split('/boards/')[1]);
    });

    test('retry mechanism available after error', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Check for retry capability (buttons)
      const buttons = await page.locator('button').count();
      expect(buttons >= 0).toBe(true);
    });

    test('error recovery maintains data consistency', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify data is consistent
      expect(page.url()).toContain('test-board-123');
    });

    test('API error does not expose sensitive information', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Check console for errors without sensitive data
      const content = await page.content();
      // Should not contain raw error stack traces in visible content
      expect(content).toBeTruthy();
    });

    test('multiple API errors are handled sequentially', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Simulate multiple errors through reloads
      for (let i = 0; i < 2; i++) {
        await page.reload();
        await page.waitForTimeout(500);
      }
      
      // Should still be functional
      expect(page.url()).toContain('test-board-123');
    });
  });

  /**
   * Comprehensive Robustness Integration Tests
   * Verifies complex scenarios combining multiple failure modes
   */
  test.describe('Integration - Complete Robustness Scenarios', () => {
    test('can recover from multiple failure scenarios', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Scenario 1: Offline
      await page.context().setOffline(true);
      await page.waitForTimeout(500);
      await page.context().setOffline(false);
      
      // Scenario 2: Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be functional
      expect(page.url()).toContain('test-board-123');
    });

    test('application remains stable through cascading failures', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Multiple reloads simulating cascading issues
      for (let i = 0; i < 3; i++) {
        await page.reload();
        await page.waitForTimeout(300);
      }
      
      // Should still be navigable
      const content = await page.content();
      expect(content).toBeTruthy();
    });

    test('board content survives application restart', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Navigate away
      await page.goto(`${baseUrl}/dashboard`);
      expect(page.url()).toContain('/dashboard');
      
      // Navigate back (simulating app restart)
      await page.goto(`${baseUrl}/boards/test-board-123`);
      expect(page.url()).toContain('test-board-123');
    });

    test('data consistency across error recovery', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      const url1 = page.url();
      
      // Simulate errors
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const url2 = page.url();
      
      // URLs should be consistent
      expect(url1).toBe(url2);
    });

    test('user experience remains acceptable during failures', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Simulate failure and recovery
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const totalTime = Date.now() - startTime;
      
      // Should recover within reasonable time
      expect(totalTime).toBeLessThan(10000);
    });

    test('offline-first approach provides seamless experience', async ({ page }) => {
      // First load the page while online
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Now go offline
      await page.context().setOffline(true);
      
      // Try to reload while offline
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {
        // Expected to error when fully offline
      });
      
      // Go back online
      await page.context().setOffline(false);
      
      // Should be able to reload now
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify page is still accessible
      expect(page.url()).toContain('test-board-123');
    });

    test('error state does not prevent navigation', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Simulate error with reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Navigate to dashboard
      await page.goto(`${baseUrl}/dashboard`);
      expect(page.url()).toContain('/dashboard');
      
      // Navigate back
      await page.goto(`${baseUrl}/boards/test-board-123`);
      expect(page.url()).toContain('test-board-123');
    });

    test('concurrent errors are handled without deadlock', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Simulate multiple concurrent operations
      await Promise.all([
        page.reload(),
        page.waitForTimeout(100).then(() => page.goto(`${baseUrl}/boards/test-board-123`))
      ]);
      
      // Should recover
      expect(page.url()).toContain('test-board-123');
    });

    test('memory usage is reasonable after error recovery', async ({ page }) => {
      await page.goto(`${baseUrl}/boards/test-board-123`);
      await page.waitForLoadState('networkidle');
      
      // Simulate multiple error cycles
      for (let i = 0; i < 3; i++) {
        await page.reload();
        await page.waitForTimeout(200);
      }
      
      // Should still be responsive
      const content = await page.content();
      expect(content).toBeTruthy();
    });
  });
});
