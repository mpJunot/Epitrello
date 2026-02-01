import { graphqlRequest } from '../graphql-client';
import type {
  Attachment,
  CreateAttachmentInput,
  UpdateAttachmentInput,
} from '../graphql-types';

export type { Attachment, CreateAttachmentInput, UpdateAttachmentInput };

const ATTACHMENT_FIELDS = `
  id
  cardId
  uploaderId
  url
  filename
  size
  createdAt
  uploader {
    id
    name
    email
    avatar
  }
`;

/**
 * Fetch attachments for a card. User must have access to the board.
 */
export async function getCardAttachments(
  cardId: string
): Promise<Attachment[]> {
  const query = `
    query CardAttachments($cardId: ID!) {
      cardAttachments(cardId: $cardId) {
        ${ATTACHMENT_FIELDS}
      }
    }
  `;
  const result = await graphqlRequest<{ cardAttachments: Attachment[] }>(
    query,
    { cardId }
  );
  return result.cardAttachments;
}

/**
 * Create an attachment on a card (link or inline data URL).
 */
export async function createAttachment(
  input: CreateAttachmentInput
): Promise<Attachment> {
  const mutation = `
    mutation CreateAttachment($input: CreateAttachmentInput!) {
      createAttachment(input: $input) {
        ${ATTACHMENT_FIELDS}
      }
    }
  `;
  const result = await graphqlRequest<{ createAttachment: Attachment }>(
    mutation,
    { input }
  );
  return result.createAttachment;
}

/**
 * Update an attachment. Uploader only.
 */
export async function updateAttachment(
  input: UpdateAttachmentInput
): Promise<Attachment> {
  const mutation = `
    mutation UpdateAttachment($input: UpdateAttachmentInput!) {
      updateAttachment(input: $input) {
        ${ATTACHMENT_FIELDS}
      }
    }
  `;
  const result = await graphqlRequest<{ updateAttachment: Attachment }>(
    mutation,
    { input }
  );
  return result.updateAttachment;
}

/**
 * Delete an attachment. Uploader only.
 */
export async function deleteAttachment(id: string): Promise<boolean> {
  const mutation = `
    mutation DeleteAttachment($id: ID!) {
      deleteAttachment(id: $id)
    }
  `;
  const result = await graphqlRequest<{ deleteAttachment: boolean }>(
    mutation,
    { id }
  );
  return result.deleteAttachment;
}
