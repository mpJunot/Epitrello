import { graphqlRequest } from '../graphql-client';
import type { Label as GqlLabel } from '../graphql-types';

export type Label = GqlLabel;

/**
 * Get all labels for a board
 */
export async function getBoardLabels(boardId: string): Promise<Label[]> {
  const query = `
    query BoardLabels($boardId: ID!) {
      boardLabels(boardId: $boardId) {
        id
        boardId
        name
        color
      }
    }
  `;

  const result = await graphqlRequest<{ boardLabels: Label[] }>(query, { boardId });
  return result.boardLabels;
}

/**
 * Create a new label
 * Backend expects: boardId (required), color (required, one of: green, yellow, orange, red, purple, blue, sky, lime, pink, black), name (optional)
 */
export async function createLabel(input: { boardId: string; name?: string; color: string }): Promise<Label> {
  const boardId = typeof input.boardId === 'string' ? input.boardId.trim() : '';
  if (!boardId) {
    throw new Error('Board is required to create a label');
  }
  const color = (typeof input.color === 'string' ? input.color.trim() : '') || '';
  if (!color) {
    throw new Error('Color is required to create a label');
  }

  const mutation = `
    mutation CreateLabel($input: CreateLabelInput!) {
      createLabel(input: $input) {
        id
        boardId
        name
        color
      }
    }
  `;

  const result = await graphqlRequest<{ createLabel: Label }>(mutation, {
    input: {
      boardId,
      name: input.name != null ? String(input.name).trim() : '',
      color,
    },
  });
  return result.createLabel;
}

/**
 * Delete a label
 */
export async function deleteLabel(id: string): Promise<boolean> {
  const mutation = `
    mutation DeleteLabel($id: ID!) {
      deleteLabel(id: $id)
    }
  `;

  const result = await graphqlRequest<{ deleteLabel: boolean }>(mutation, { id });
  return result.deleteLabel;
}
