import { graphqlRequest } from '../graphql-client';

export type ActivityType =
  | 'CARD_CREATED'
  | 'CARD_COMPLETED'
  | 'CARD_UNCOMPLETED'
  | 'CARD_MOVED'
  | 'COMMENT_ADDED'
  | 'MEMBER_ADDED_TO_CARD'
  | 'MEMBER_ADDED_TO_BOARD'
  | 'CARD_ARCHIVED'
  | 'CARD_UNARCHIVED'
  | 'LIST_ARCHIVED'
  | 'LIST_UNARCHIVED'
  | 'BOARD_ARCHIVED'
  | 'BOARD_UNARCHIVED';

export interface ActivityPayload {
  cardTitle?: string;
  listName?: string;
  targetListName?: string;
  commentPreview?: string;
  memberName?: string;
  boardTitle?: string;
}

export interface ActivityUser {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface ActivityBoard {
  id: string;
  title: string;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  userId: string;
  boardId: string;
  cardId?: string | null;
  listId?: string | null;
  payload?: ActivityPayload | null;
  createdAt: string;
  user?: ActivityUser | null;
  board?: ActivityBoard | null;
}

export interface MyActivityResult {
  activities: ActivityItem[];
  hasMore: boolean;
  nextCursor?: string | null;
}

export interface MyActivityInput {
  limit?: number;
  cursor?: string;
  workspaceIds?: string[];
}

export interface BoardActivityInput {
  limit?: number;
  cursor?: string;
}

/**
 * Get activity for a board (all members). User must have access to the board.
 */
export async function getBoardActivity(
  boardId: string,
  input?: BoardActivityInput,
): Promise<MyActivityResult> {
  const query = `
    query BoardActivity($boardId: String!, $input: BoardActivityInput) {
      boardActivity(boardId: $boardId, input: $input) {
        activities {
          id
          type
          userId
          boardId
          cardId
          listId
          payload {
            cardTitle
            listName
            targetListName
            commentPreview
            memberName
            boardTitle
          }
          createdAt
          user {
            id
            name
            avatar
          }
          board {
            id
            title
          }
        }
        hasMore
        nextCursor
      }
    }
  `;

  const result = await graphqlRequest<{ boardActivity: MyActivityResult }>(query, {
    boardId,
    input: input ?? undefined,
  });
  return result.boardActivity;
}

/**
 * Get activity feed from all boards the user has access to (all members). Used for Activity pages.
 */
export async function getActivityFeed(
  input?: MyActivityInput,
): Promise<MyActivityResult> {
  const query = `
    query ActivityFeed($input: MyActivityInput) {
      activityFeed(input: $input) {
        activities {
          id
          type
          userId
          boardId
          cardId
          listId
          payload {
            cardTitle
            listName
            targetListName
            commentPreview
            memberName
            boardTitle
          }
          createdAt
          user {
            id
            name
            avatar
          }
          board {
            id
            title
          }
        }
        hasMore
        nextCursor
      }
    }
  `;

  const result = await graphqlRequest<{ activityFeed: MyActivityResult }>(query, {
    input: input ?? undefined,
  });
  return result.activityFeed;
}

/**
 * Get current user's activity log with optional workspace filter and pagination.
 */
export async function getMyActivity(input?: MyActivityInput): Promise<MyActivityResult> {
  const query = `
    query MyActivity($input: MyActivityInput) {
      myActivity(input: $input) {
        activities {
          id
          type
          userId
          boardId
          cardId
          listId
          payload {
            cardTitle
            listName
            targetListName
            commentPreview
            memberName
            boardTitle
          }
          createdAt
          user {
            id
            name
            avatar
          }
          board {
            id
            title
          }
        }
        hasMore
        nextCursor
      }
    }
  `;

  const result = await graphqlRequest<{ myActivity: MyActivityResult }>(query, {
    input: input ?? undefined,
  });
  return result.myActivity;
}
