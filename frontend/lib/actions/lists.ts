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

/**
 * Get all lists for a board (currently returns empty array as backend doesn't expose this query yet)
 * For now, we'll create default lists if none exist
 */
export async function getBoardLists(boardId: string): Promise<List[]> {
  // Note: The backend doesn't seem to have a direct query to get board lists
  // This is a workaround - we return empty array and create lists on demand
  return [];
}
