import { graphqlRequest } from '../graphql-client';

export interface List {
  id: string;
  title: string;
  position?: number;
  boardId?: string;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateListInput {
  boardId: string;
  title: string;
  position?: number;
}

export interface UpdateListInput {
  id: string;
  title?: string;
  position?: number;
}

    export async function createList(input: CreateListInput): Promise<List> {
    const mutation = `
        mutation CreateList($input: CreateListInput!) {
        createList(input: $input) {
            id
            title
            position
            boardId
            isArchived
            createdAt
            updatedAt
        }
        }
    `;

    const result = await graphqlRequest<{ createList: List }>(mutation, { input });
    return result.createList;
    }

export async function updateList(input: UpdateListInput): Promise<List> {
  const mutation = `
    mutation UpdateList($input: UpdateListInput!) {
      updateList(input: $input) {
        id
        title
        position
        boardId
        isArchived
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ updateList: List }>(mutation, { input });
  return result.updateList;
}

export async function reorderLists(input: { boardId: string; listPositions: { id: string; position: number }[] }): Promise<List[]> {
  const mutation = `
    mutation ReorderLists($input: ReorderListsInput!) {
      reorderLists(input: $input) {
        id
        title
        position
        boardId
        isArchived
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ reorderLists: List[] }>(mutation, { input });
  return result.reorderLists;
}

export async function deleteList(id: string): Promise<boolean> {
  const mutation = `
    mutation DeleteList($id: ID!) {
      deleteList(id: $id)
    }
  `;

  const result = await graphqlRequest<{ deleteList: boolean }>(mutation, { id });
  return result.deleteList;
}

export async function archiveList(id: string): Promise<List> {
  const mutation = `
    mutation ArchiveList($id: ID!) {
      archiveList(id: $id) {
        id
        title
        position
        boardId
        isArchived
        createdAt
        updatedAt
      }
    }
  `;
  const result = await graphqlRequest<{ archiveList: List }>(mutation, { id });
  return result.archiveList;
}

export async function unarchiveList(id: string): Promise<List> {
  const mutation = `
    mutation UnarchiveList($id: ID!) {
      unarchiveList(id: $id) {
        id
        title
        position
        boardId
        isArchived
        createdAt
        updatedAt
      }
    }
  `;
  const result = await graphqlRequest<{ unarchiveList: List }>(mutation, { id });
  return result.unarchiveList;
}

/**
 * Get archived lists for a board
 */
export async function getArchivedLists(boardId: string): Promise<List[]> {
  const query = `
    query ArchivedLists($boardId: ID!) {
      archivedLists(boardId: $boardId) {
        id
        title
        position
        boardId
        isArchived
        createdAt
        updatedAt
      }
    }
  `;
  const result = await graphqlRequest<{ archivedLists: List[] }>(query, { boardId });
  return result.archivedLists ?? [];
}

/**
 * Get all lists for a board (currently returns empty array as backend doesn't expose this query yet)
 * For now, we'll create default lists if none exist
 */
export async function getBoardLists(): Promise<List[]> {
  // Note: The backend doesn't seem to have a direct query to get board lists
  // This is a workaround - we return empty array and create lists on demand
  return [];
}
