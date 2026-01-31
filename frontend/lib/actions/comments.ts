import { graphqlRequest } from '../graphql-client';
import type {
  Comment,
  CreateCommentInput,
  UpdateCommentInput,
} from '../graphql-types';

export type { Comment, CreateCommentInput, UpdateCommentInput };

const COMMENT_FIELDS = `
  id
  cardId
  authorId
  content
  createdAt
  updatedAt
  author {
    id
    name
    email
    avatar
  }
`;

/**
 * Fetch comments for a card. User must have access to the board.
 */
export async function getCardComments(cardId: string): Promise<Comment[]> {
  const query = `
    query CardComments($cardId: ID!) {
      cardComments(cardId: $cardId) {
        ${COMMENT_FIELDS}
      }
    }
  `;
  const result = await graphqlRequest<{ cardComments: Comment[] }>(query, {
    cardId,
  });
  return result.cardComments;
}

/**
 * Create a comment on a card.
 */
export async function createComment(
  input: CreateCommentInput,
): Promise<Comment> {
  const mutation = `
    mutation CreateComment($input: CreateCommentInput!) {
      createComment(input: $input) {
        ${COMMENT_FIELDS}
      }
    }
  `;
  const result = await graphqlRequest<{ createComment: Comment }>(mutation, {
    input,
  });
  return result.createComment;
}

/**
 * Update a comment. Author only.
 */
export async function updateComment(
  input: UpdateCommentInput,
): Promise<Comment> {
  const mutation = `
    mutation UpdateComment($input: UpdateCommentInput!) {
      updateComment(input: $input) {
        ${COMMENT_FIELDS}
      }
    }
  `;
  const result = await graphqlRequest<{ updateComment: Comment }>(mutation, {
    input,
  });
  return result.updateComment;
}

/**
 * Delete a comment. Author only.
 */
export async function deleteComment(id: string): Promise<boolean> {
  const mutation = `
    mutation DeleteComment($id: ID!) {
      deleteComment(id: $id)
    }
  `;
  const result = await graphqlRequest<{ deleteComment: boolean }>(mutation, {
    id,
  });
  return result.deleteComment;
}
