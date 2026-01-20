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
  lists?: Array<{
    id: string;
    title: string;
    position: number;
    cards?: Array<{
      id: string;
      title: string;
      description?: string;
      position: number;
    }>;
  }>;
}

export interface CreateBoardInput {
  title: string;
  description?: string;
  background?: string;
  visibility?: Visibility;
  workspaceId?: string;
}

export type BoardDetail = Board;

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

/**
 * Get a board by ID (backend integration)
 * Now includes lists with cards
 */
export async function getBoard(id: string): Promise<BoardDetail> {
  const query = `
    query Board($id: ID!) {
      board(id: $id) {
        id
        title
        description
        background
        visibility
        workspaceId
        createdAt
        updatedAt
        lists {
          id
          title
          position
          cards {
            id
            title
            description
            position
          }
        }
      }
    }
  `;

  const result = await graphqlRequest<{ board: BoardDetail }>(query, { id });
  return result.board;
}
