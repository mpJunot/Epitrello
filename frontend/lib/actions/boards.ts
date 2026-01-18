import { graphqlRequest } from '../graphql-client';

export type Visibility = 'PRIVATE' | 'PUBLIC' | 'WORKSPACE';

export interface Board {
  id: string;
  title: string;
  description?: string;
  background?: string;
  visibility: Visibility;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardInput {
  title: string;
  description?: string;
  background?: string;
  visibility?: Visibility;
  workspaceId?: string;
}

/**
 * Create a new board (backend integration)
 */
export async function createBoard(input: CreateBoardInput): Promise<Board> {
  const mutation = `
    mutation CreateBoard($input: CreateBoardInput!) {
      createBoard(input: $input) {
        id
        title
        description
        background
        visibility
        workspaceId
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ createBoard: Board }>(mutation, { input });
  return result.createBoard;
}
