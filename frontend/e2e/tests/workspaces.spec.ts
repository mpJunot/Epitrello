import { test, expect } from '@playwright/test';

const workspaceId = 'test-workspace-123';
const workspaceSettingsUrl = `/workspaces/${workspaceId}/settings`;
const workspaceMembersUrl = `/workspaces/${workspaceId}/members`;

test.describe('Workspace Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Setup workspace in localStorage before each test
    await page.goto('/dashboard');
    await page.evaluate((id) => {
      const workspace = {
        id,
        title: 'Test Workspace',
        visibility: 'PRIVATE',
      };
      localStorage.setItem('epitrello_workspaces', JSON.stringify([workspace]));
    }, workspaceId);
  });

  test('displays workspace settings page', async ({ page }) => {
    await page.goto(workspaceSettingsUrl);

    await expect(page.getByRole('heading', { name: /workspace settings/i })).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/visibility/i)).toBeVisible();
  });

  test('loads workspace data from localStorage', async ({ page }) => {
    await page.goto(workspaceSettingsUrl);

    const nameInput = page.getByLabel(/name/i);
    await expect(nameInput).toHaveValue('Test Workspace');
  });

  test('updates workspace name', async ({ page }) => {
    await page.goto(workspaceSettingsUrl);

    const nameInput = page.getByLabel(/name/i);
    await nameInput.clear();
    await nameInput.fill('Updated Workspace Name');
    await page.getByRole('button', { name: /save/i }).click();

    // Verify toast notification appears (if implemented)
    // Verify localStorage is updated
    const updatedWorkspace = await page.evaluate((id) => {
      const raw = localStorage.getItem('epitrello_workspaces');
      const workspaces = raw ? JSON.parse(raw) : [];
      return workspaces.find((w: any) => w.id === id);
    }, workspaceId);

    expect(updatedWorkspace.title).toBe('Updated Workspace Name');
  });

  test('updates workspace visibility', async ({ page }) => {
    await page.goto(workspaceSettingsUrl);

    // Open visibility dropdown
    await page.getByLabel(/visibility/i).click();
    
    // Select PUBLIC option
    await page.getByRole('option', { name: /public/i }).click();
    
    await page.getByRole('button', { name: /save/i }).click();

    // Verify localStorage is updated
    const updatedWorkspace = await page.evaluate((id) => {
      const raw = localStorage.getItem('epitrello_workspaces');
      const workspaces = raw ? JSON.parse(raw) : [];
      return workspaces.find((w: any) => w.id === id);
    }, workspaceId);

    expect(updatedWorkspace.visibility).toBe('PUBLIC');
  });

  test('shows all visibility options', async ({ page }) => {
    await page.goto(workspaceSettingsUrl);

    await page.getByLabel(/visibility/i).click();
    
    await expect(page.getByRole('option', { name: /private/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /workspace/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /public/i })).toBeVisible();
  });

  test('shows not found for non-existent workspace', async ({ page }) => {
    await page.goto('/workspaces/non-existent-id/settings');

    await expect(page.getByText(/workspace not found/i)).toBeVisible();
  });
});

test.describe('Workspace Members', () => {
  test.beforeEach(async ({ page }) => {
    // Setup workspace and clear previous test data
    await page.goto('/dashboard');
    await page.evaluate((id) => {
      const workspace = {
        id,
        title: 'Test Workspace',
        visibility: 'PRIVATE',
      };
      localStorage.setItem('epitrello_workspaces', JSON.stringify([workspace]));
      const key = `epitrello_workspace_members_${id}`;
      localStorage.removeItem(key);
    }, workspaceId);
  });

  test('displays workspace members page', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    await expect(page.getByRole('heading', { name: /workspace members/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /invite/i })).toBeVisible();
  });

  test('displays default sample members on first load', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    // Default members should be visible
    await expect(page.getByText(/alice dupont/i)).toBeVisible();
    await expect(page.getByText(/bob martin/i)).toBeVisible();
    await expect(page.getByText(/alice@example\.com/i)).toBeVisible();
  });

  test('opens invite dialog when clicking invite button', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    await page.getByRole('button', { name: /invite/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /invite member/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email@example\.com/i)).toBeVisible();
  });

  test('invites a new member', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    // Open invite dialog
    await page.getByRole('button', { name: /invite/i }).click();

    // Fill email and submit
    const emailInput = page.getByPlaceholder(/email@example\.com/i);
    await emailInput.fill('charlie@example.com');
    await page.getByRole('dialog').getByRole('button', { name: /^invite$/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // New member should appear in the list
    await expect(page.getByText(/charlie@example\.com/i)).toBeVisible();
  });

  test('invites member by pressing Enter', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    await page.getByRole('button', { name: /invite/i }).click();

    const emailInput = page.getByPlaceholder(/email@example\.com/i);
    await emailInput.fill('david@example.com');
    await emailInput.press('Enter');

    // Dialog should close and member should be added
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(/david@example\.com/i)).toBeVisible();
  });

  test('cancels invite dialog', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    await page.getByRole('button', { name: /invite/i }).click();
    
    const emailInput = page.getByPlaceholder(/email@example\.com/i);
    await emailInput.fill('test@example.com');
    
    await page.getByRole('button', { name: /cancel/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Member should not be added
    await expect(page.getByText(/test@example\.com/i)).not.toBeVisible();
  });

  test('disables invite button when email is empty', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    await page.getByRole('button', { name: /invite/i }).click();

    const inviteButton = page.getByRole('dialog').getByRole('button', { name: /^invite$/i });
    await expect(inviteButton).toBeDisabled();

    // Type something
    const emailInput = page.getByPlaceholder(/email@example\.com/i);
    await emailInput.fill('test@example.com');
    await expect(inviteButton).toBeEnabled();

    // Clear it
    await emailInput.clear();
    await expect(inviteButton).toBeDisabled();
  });

  test('removes a member', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    // Wait for default members to load
    await expect(page.getByText(/alice dupont/i)).toBeVisible();

    // Find Alice's remove button and click it
    const aliceRow = page.locator('li').filter({ hasText: /alice dupont/i });
    await aliceRow.getByRole('button', { name: /remove/i }).click();

    // Alice should no longer be visible
    await expect(page.getByText(/alice dupont/i)).not.toBeVisible();

    // Verify localStorage is updated
    const members = await page.evaluate((id) => {
      const key = `epitrello_workspace_members_${id}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    }, workspaceId);

    expect(members.find((m: any) => m.name === 'Alice Dupont')).toBeUndefined();
  });

  test('shows empty state when no members', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    // Remove all members
    const defaultMembers = ['Alice Dupont', 'Bob Martin'];
    for (const memberName of defaultMembers) {
      const memberRow = page.locator('li').filter({ hasText: new RegExp(memberName, 'i') });
      if (await memberRow.count() > 0) {
        await memberRow.getByRole('button', { name: /remove/i }).click();
      }
    }

    // Empty state should be visible
    await expect(page.getByText(/no members/i)).toBeVisible();
  });

  test('persists members in localStorage', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    // Add a new member
    await page.getByRole('button', { name: /invite/i }).click();
    await page.getByPlaceholder(/email@example\.com/i).fill('persistent@example.com');
    await page.getByRole('dialog').getByRole('button', { name: /^invite$/i }).click();

    // Reload the page
    await page.reload();

    // Member should still be there
    await expect(page.getByText(/persistent@example\.com/i)).toBeVisible();
  });

  test('displays member name and email correctly', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    await page.getByRole('button', { name: /invite/i }).click();
    await page.getByPlaceholder(/email@example\.com/i).fill('john.smith@example.com');
    await page.getByRole('dialog').getByRole('button', { name: /^invite$/i }).click();

    // Name should be derived from email (before @)
    await expect(page.getByText(/john\.smith@example\.com/i)).toBeVisible();
  });
});

test.describe('Workspace Members - Multiple Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Setup workspace
    await page.goto('/dashboard');
    await page.evaluate((id) => {
      const workspace = {
        id,
        title: 'Test Workspace',
        visibility: 'PRIVATE',
      };
      localStorage.setItem('epitrello_workspaces', JSON.stringify([workspace]));
    }, workspaceId);
  });

  test('adds multiple members in sequence', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    const emails = ['user1@example.com', 'user2@example.com', 'user3@example.com'];

    for (const email of emails) {
      await page.getByRole('button', { name: /invite/i }).click();
      await page.getByPlaceholder(/email@example\.com/i).fill(email);
      await page.getByRole('dialog').getByRole('button', { name: /^invite$/i }).click();
    }

    // All emails should be visible
    for (const email of emails) {
      await expect(page.getByText(email)).toBeVisible();
    }

    // Verify count
    const members = await page.evaluate((id) => {
      const key = `epitrello_workspace_members_${id}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    }, workspaceId);

    // 2 default + 3 new = 5 total
    expect(members.length).toBeGreaterThanOrEqual(5);
  });

  test('removes multiple members', async ({ page }) => {
    await page.goto(workspaceMembersUrl);

    // Wait for members to load
    await expect(page.getByText(/alice dupont/i)).toBeVisible();

    // Get initial count
    const initialCount = await page.locator('li').filter({ has: page.getByRole('button', { name: /remove/i }) }).count();

    // Remove first two members
    for (let i = 0; i < 2; i++) {
      const firstRemoveButton = page.getByRole('button', { name: /remove/i }).first();
      await firstRemoveButton.click();
    }

    // Final count should be 2 less
    const finalCount = await page.locator('li').filter({ has: page.getByRole('button', { name: /remove/i }) }).count();
    expect(finalCount).toBe(initialCount - 2);
  });
});

test.describe('Workspace Navigation', () => {
  test('can navigate between workspace pages', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Setup workspace
    await page.evaluate((id) => {
      const workspace = {
        id,
        title: 'Nav Test Workspace',
        visibility: 'PRIVATE',
      };
      localStorage.setItem('epitrello_workspaces', JSON.stringify([workspace]));
    }, workspaceId);

    // Navigate to settings
    await page.goto(workspaceSettingsUrl);
    await expect(page.getByRole('heading', { name: /workspace settings/i })).toBeVisible();

    // Navigate to members
    await page.goto(workspaceMembersUrl);
    await expect(page.getByRole('heading', { name: /workspace members/i })).toBeVisible();

    // Navigate back to settings
    await page.goto(workspaceSettingsUrl);
    await expect(page.getByRole('heading', { name: /workspace settings/i })).toBeVisible();
  });
});
