import { graphqlRequest } from '../graphql-client';
import type {
  Board as GqlBoard,
  BoardMemberWithUser,
  BoardTemplate,
  Visibility,
  List as GqlList,
  Card as GqlCard,
  CreateBoardInput as GqlCreateBoardInput,
  UpdateBoardInput as GqlUpdateBoardInput,
} from '../graphql-types';

export type Board = Omit<GqlBoard, 'lists'> & {
  lists?: Array<GqlList & {
    cards?: Array<Pick<GqlCard, 'id' | 'title' | 'description' | 'position'>>;
  }>;
};

export type { BoardTemplate, Visibility, BoardMemberWithUser };

export type CreateBoardInput = GqlCreateBoardInput & { templateId?: string };

export type CopyBoardInput = {
  sourceBoardId: string;
  title: string;
  workspaceId?: string;
  description?: string;
  visibility?: Visibility;
  background?: string;
};

export type UpdateBoardInput = GqlUpdateBoardInput;

export type BoardDetail = Board;

/**
 * Fetch predefined board templates (blank, kanban, sprint, project).
 */
export async function getBoardTemplates(): Promise<BoardTemplate[]> {
  const query = `
    query BoardTemplates {
      boardTemplates {
        id
        name
        description
        listTitles
      }
    }
  `;
  const result = await graphqlRequest<{ boardTemplates: BoardTemplate[] }>(query);
  return result.boardTemplates;
}

/**
 * Create a new board (backend integration). Optionally use a templateId (blank, kanban, sprint, project).
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
 * Copy a board (lists, cards, labels, checklists). Returns the new board.
 */
export async function copyBoard(input: CopyBoardInput): Promise<Board> {
  const mutation = `
    mutation CopyBoard($input: CopyBoardInput!) {
      copyBoard(input: $input) {
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

  const result = await graphqlRequest<{ copyBoard: Board }>(mutation, { input });
  return result.copyBoard;
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
            description
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
            background
            dueDate
            startDate
            createdAt
            assignees {
              id
              name
              email
              avatar
            }
            labels {
              id
              name
              color
            }
            checklists {
              id
              title
              items {
                id
                checked
                content
                position
                checklistId
              }
            }
          }
        }
      }
    }
  `;

  const result = await graphqlRequest<{ board: BoardDetail }>(query, { id });
  return result.board;
}

/**
 * Update a board
 */
export async function updateBoard(input: UpdateBoardInput): Promise<Board> {
  const mutation = `
    mutation UpdateBoard($input: UpdateBoardInput!) {
      updateBoard(input: $input) {
        id
        title
        description
        background
        visibility
        workspaceId
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ updateBoard: Board }>(mutation, { input });
  return result.updateBoard;
}

/**
 * Add a member to a board (admin only)
 */
export async function addBoardMember(
  boardId: string,
  userId: string,
  role: 'ADMIN' | 'MEMBER' | 'OBSERVER' = 'MEMBER',
): Promise<BoardMemberWithUser> {
  const mutation = `
    mutation AddBoardMember($input: AddBoardMemberInput!) {
      addBoardMember(input: $input) {
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
    }
  `;
  const result = await graphqlRequest<{ addBoardMember: BoardMemberWithUser }>(mutation, {
    input: { boardId, userId, role },
  });
  return result.addBoardMember;
}

/**
 * Remove a member from a board (admin only)
 */
export async function removeBoardMember(boardId: string, userId: string): Promise<boolean> {
  const mutation = `
    mutation RemoveBoardMember($boardId: ID!, $userId: ID!) {
      removeBoardMember(boardId: $boardId, userId: $userId)
    }
  `;

  const result = await graphqlRequest<{ removeBoardMember: boolean }>(mutation, { boardId, userId });
  return result.removeBoardMember;
}

/**
 * Update a member's role on a board (board admin only).
 * Cannot remove the last ADMIN.
 */
export async function updateBoardMemberRole(
  boardId: string,
  userId: string,
  role: string,
): Promise<boolean> {
  const mutation = `
    mutation UpdateBoardMemberRole($input: UpdateBoardMemberRoleInput!) {
      updateBoardMemberRole(input: $input)
    }
  `;
  const result = await graphqlRequest<{ updateBoardMemberRole: boolean }>(mutation, {
    input: { boardId, userId, role },
  });
  return result.updateBoardMemberRole;
}

/**
 * Leave a board (any member can leave)
 */
export async function leaveBoard(boardId: string): Promise<boolean> {
  const mutation = `
    mutation LeaveBoard($boardId: ID!) {
      leaveBoard(boardId: $boardId)
    }
  `;

  const result = await graphqlRequest<{ leaveBoard: boolean }>(mutation, { boardId });
  return result.leaveBoard;
}
