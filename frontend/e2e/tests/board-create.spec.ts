import { test, expect, type Page } from '@playwright/test';

type GraphQLBody = {
  query?: string;
  variables?: Record<string, unknown>;
};

type Workspace = {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  visibility: 'PRIVATE' | 'PUBLIC' | 'WORKSPACE';
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  memberships: Array<{ id: string; userId: string; role: string; joinedAt: string }>;
};

type Board = {
  id: string;
  title: string;
  description?: string | null;
  background?: string | null;
  visibility: 'PRIVATE' | 'PUBLIC' | 'WORKSPACE';
  workspaceId?: string | null;
  members?: Array<{ id: string }>;
};

const defaultWorkspace: Workspace = {
  id: 'ws-1',
  name: 'Test Workspace',
  logoUrl: null,
  description: null,
  visibility: 'PRIVATE',
  memberCount: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  memberships: [],
};

async function mockGraphQL(
  page: Page,
  options?: {
    boardsByWorkspace?: Record<string, Board[]>;
    onCreateInput?: (input: Record<string, unknown>) => void;
  },
) {
  const boardsByWorkspace = options?.boardsByWorkspace ?? { [defaultWorkspace.id]: [] };

  await page.route('**/graphql', async (route) => {
    const body = (route.request().postDataJSON() as GraphQLBody) || {};
    const query = body.query ?? '';

    if (query.includes('MyWorkspaces')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { myWorkspaces: [defaultWorkspace] } }),
      });
      return;
    }

    if (query.includes('MyInvitations')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { myInvitations: [] } }),
      });
      return;
    }

    if (query.includes('WorkspaceBoards')) {
      const workspaceId = String(body.variables?.workspaceId ?? defaultWorkspace.id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { workspaceBoards: boardsByWorkspace[workspaceId] ?? [] } }),
      });
      return;
    }

    if (query.includes('Workspace(') && query.includes('workspace(id:')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { workspace: defaultWorkspace } }),
      });
      return;
    }

    if (query.includes('CreateBoard')) {
      const input = body.variables?.input as Record<string, unknown> | undefined;
      if (input && options?.onCreateInput) {
        options.onCreateInput(input);
      }
      const newBoard: Board = {
        id: 'board-123',
        title: String(input?.title ?? 'New Board'),
        description: (input?.description as string | null | undefined) ?? null,
        background: (input?.background as string | null | undefined) ?? null,
        visibility: (input?.visibility as Board['visibility']) ?? 'PRIVATE',
        workspaceId: (input?.workspaceId as string | null | undefined) ?? defaultWorkspace.id,
        members: [],
      };
      const wsId = newBoard.workspaceId ?? defaultWorkspace.id;
      boardsByWorkspace[wsId] = [newBoard, ...(boardsByWorkspace[wsId] ?? [])];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            createBoard: {
              ...newBoard,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {} }),
    });
  });
}

test.describe('Board creation flows', () => {
  test('creates a board from Topbar modal (local storage)', async ({ page }) => {
    await mockGraphQL(page);
    await page.addInitScript(() => {
      localStorage.setItem('epitrello_workspaces', JSON.stringify([{ id: 'ws-1', title: 'Test Workspace' }]));
      localStorage.removeItem('epitrello_boards');
    });

    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Create a new board' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Create a new board' })).toBeVisible();

    await dialog.getByLabel('Name').fill('Local Storage Board');
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expect(page).toHaveURL(/\/boards\//);

    const createdBoard = await page.evaluate(() => {
      const raw = localStorage.getItem('epitrello_boards');
      const boards = raw ? (JSON.parse(raw) as Array<{ name: string }>) : [];
      return boards.find((b) => b.name === 'Local Storage Board');
    });

    expect(createdBoard).toBeTruthy();
  });

  test('creates a board from workspace boards page', async ({ page }) => {
    const boardsByWorkspace: Record<string, Board[]> = { [defaultWorkspace.id]: [] };
    await mockGraphQL(page, { boardsByWorkspace });
    await page.addInitScript(() => {
      localStorage.setItem('epitrello_workspaces', JSON.stringify([{ id: 'ws-1', title: 'Test Workspace' }]));
    });

    await page.goto(`/workspaces/${defaultWorkspace.id}/boards`);

    await page.getByRole('button', { name: 'Add a board' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Create a new board' })).toBeVisible();

    await dialog.getByLabel('Name').fill('Workspace Board');
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expect(page).toHaveURL(/\/boards\/board-123/);
  });

  test('creates a board from dashboard workspace card', async ({ page }) => {
    const boardsByWorkspace: Record<string, Board[]> = { [defaultWorkspace.id]: [] };
    await mockGraphQL(page, { boardsByWorkspace });

    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'New board' }).first().click();
    const nameInput = page.getByPlaceholder('Board name');
    await nameInput.fill('Dashboard Board');
    const formCard = nameInput.locator('..').locator('..');
    await formCard.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByPlaceholder('Board name')).toBeHidden();
  });
});

test.describe('Board core flows', () => {
  test('opens an existing board from workspace boards page', async ({ page }) => {
    const boardsByWorkspace: Record<string, Board[]> = {
      [defaultWorkspace.id]: [
        {
          id: 'board-existing-1',
          title: 'Existing Board',
          description: null,
          background: null,
          visibility: 'PRIVATE',
          workspaceId: defaultWorkspace.id,
          members: [],
        },
      ],
    };
    await mockGraphQL(page, { boardsByWorkspace });

    await page.goto(`/workspaces/${defaultWorkspace.id}/boards`);
    await page.getByText('Existing Board').click();

    await expect(page).toHaveURL(/\/boards\/board-existing-1/);
  });

  test('sends correct visibility when creating a board', async ({ page }) => {
    let lastCreateInput: Record<string, unknown> | null = null;
    await mockGraphQL(page, {
      boardsByWorkspace: { [defaultWorkspace.id]: [] },
      onCreateInput: (input) => {
        lastCreateInput = input;
      },
    });

    await page.goto(`/workspaces/${defaultWorkspace.id}/boards`);

    await page.getByRole('button', { name: 'Add a board' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill('Public Board');

    await dialog.getByLabel('Visibility').click();
    await page.getByRole('option', { name: 'Public' }).click();
    await dialog.getByRole('button', { name: 'Create' }).click();

    expect(lastCreateInput).toBeTruthy();
    expect(lastCreateInput?.visibility).toBe('PUBLIC');
  });

  test('initial load and reload preserve board list', async ({ page }) => {
    const boardsByWorkspace: Record<string, Board[]> = {
      [defaultWorkspace.id]: [
        {
          id: 'board-persist-1',
          title: 'Persistent Board',
          description: null,
          background: null,
          visibility: 'PRIVATE',
          workspaceId: defaultWorkspace.id,
          members: [],
        },
      ],
    };
    await mockGraphQL(page, { boardsByWorkspace });

    await page.goto(`/workspaces/${defaultWorkspace.id}/boards`);
    await expect(page.getByText('Persistent Board')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Persistent Board')).toBeVisible();
  });

});
