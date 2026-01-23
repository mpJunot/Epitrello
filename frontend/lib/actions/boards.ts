import { graphqlRequest } from '../graphql-client';
import type {
  Board as GqlBoard,
  BoardMemberWithUser,
  Visibility,
  List as GqlList,
  Card as GqlCard,
  CreateBoardInput as GqlCreateBoardInput,
} from '../graphql-types';

export type Board = Omit<GqlBoard, 'lists'> & {
  lists?: Array<GqlList & {
    cards?: Array<Pick<GqlCard, 'id' | 'title' | 'description' | 'position'>>;
  }>;
};

export type { Visibility, BoardMemberWithUser };

export type CreateBoardInput = GqlCreateBoardInput;

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
        members {
          id
          userId
          role
          joinedAt
          user {
            id
            name
            email
            avatar
          }
        }
        lists {
          id
          title
          position
          cards {
            id
            title
            description
            position
            completed
          }
        }
      }
    }
  `;

  const result = await graphqlRequest<{ board: BoardDetail }>(query, { id });
  return result.board;
}
