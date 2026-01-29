import { graphqlRequest } from '../graphql-client';

export interface CardLabel {
  id: string;
  name?: string | null;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  listId?: string;
  position?: number;
  background?: string;
  dueDate?: string;
  startDate?: string;
  completed?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  labels?: CardLabel[];
}

export interface CreateCardInput {
  listId: string;
  title: string;
  description?: string;
  position?: number;
}

export interface MoveCardInput {
  cardId: string;
  targetListId: string;
  position?: number;
}

export async function createCard(input: CreateCardInput): Promise<Card> {
  const mutation = `
    mutation CreateCard($input: CreateCardInput!) {
      createCard(input: $input) {
        id
        title
        description
        listId
        position
        completed
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ createCard: Card }>(mutation, { input });
  return result.createCard;
}

export async function moveCard(input: MoveCardInput): Promise<Card> {
  const mutation = `
    mutation MoveCard($input: MoveCardInput!) {
      moveCard(input: $input) {
        id
        title
        description
        listId
        position
        completed
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ moveCard: Card }>(mutation, { input });
  return result.moveCard;
}

export async function reorderCards(input: { listId: string; cardPositions: { id: string; position: number }[] }): Promise<Card[]> {
  const mutation = `
    mutation ReorderCards($input: ReorderCardsInput!) {
      reorderCards(input: $input) {
        id
        title
        description
        listId
        position
        completed
      }
    }
  `;

  const result = await graphqlRequest<{ reorderCards: Card[] }>(mutation, { input });
  return result.reorderCards;
}

export interface UpdateCardInput {
  id: string;
  title?: string;
  description?: string;
  background?: string | null;
  dueDate?: string | null;
  startDate?: string | null;
  position?: number;
  completed?: boolean;
}

export async function updateCard(input: UpdateCardInput): Promise<Card> {
  const mutation = `
    mutation UpdateCard($input: UpdateCardInput!) {
      updateCard(input: $input) {
        id
        title
        description
        listId
        position
        background
        dueDate
        startDate
        completed
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ updateCard: Card }>(mutation, { input });
  return result.updateCard;
}

export async function deleteCard(id: string): Promise<boolean> {
  const mutation = `
    mutation DeleteCard($id: ID!) {
      deleteCard(id: $id)
    }
  `;

  const result = await graphqlRequest<{ deleteCard: boolean }>(mutation, { id });
  return result.deleteCard;
}

export interface AssignMemberInput {
  cardId: string;
  userId: string;
}

export async function assignMemberToCard(input: AssignMemberInput): Promise<Card> {
  const mutation = `
    mutation AssignMember($input: AssignMemberToCardInput!) {
      assignMemberToCard(input: $input) {
        id
        title
        description
        listId
        position
        completed
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ assignMemberToCard: Card }>(mutation, { input });
  return result.assignMemberToCard;
}

export async function unassignMemberFromCard(input: AssignMemberInput): Promise<Card> {
  const mutation = `
    mutation UnassignMember($input: UnassignMemberFromCardInput!) {
      unassignMemberFromCard(input: $input) {
        id
        title
        description
        listId
        position
        completed
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ unassignMemberFromCard: Card }>(mutation, { input });
  return result.unassignMemberFromCard;
}

export interface AddLabelToCardInput {
  cardId: string;
  labelId: string;
}

export async function addLabelToCard(input: AddLabelToCardInput): Promise<Card> {
  const mutation = `
    mutation AddLabelToCard($input: AddLabelToCardInput!) {
      addLabelToCard(input: $input) {
        id
        labels { id name color }
      }
    }
  `;
  const result = await graphqlRequest<{ addLabelToCard: Card }>(mutation, { input });
  return result.addLabelToCard;
}

export interface RemoveLabelFromCardInput {
  cardId: string;
  labelId: string;
}

export async function removeLabelFromCard(input: RemoveLabelFromCardInput): Promise<Card> {
  const mutation = `
    mutation RemoveLabelFromCard($input: RemoveLabelFromCardInput!) {
      removeLabelFromCard(input: $input) {
        id
        labels { id name color }
      }
    }
  `;
  const result = await graphqlRequest<{ removeLabelFromCard: Card }>(mutation, { input });
  return result.removeLabelFromCard;
}

export async function archiveCard(id: string): Promise<Card> {
  const mutation = `
    mutation ArchiveCard($id: ID!) {
      archiveCard(id: $id) {
        id
        title
        listId
        position
        isArchived
        createdAt
        updatedAt
      }
    }
  `;
  const result = await graphqlRequest<{ archiveCard: Card }>(mutation, { id });
  return result.archiveCard;
}

export async function unarchiveCard(id: string): Promise<Card> {
  const mutation = `
    mutation UnarchiveCard($id: ID!) {
      unarchiveCard(id: $id) {
        id
        title
        listId
        position
        isArchived
        createdAt
        updatedAt
      }
    }
  `;
  const result = await graphqlRequest<{ unarchiveCard: Card }>(mutation, { id });
  return result.unarchiveCard;
}

/**
 * Get archived cards for a board
 */
export async function getArchivedCards(boardId: string): Promise<Card[]> {
  const query = `
    query ArchivedCards($boardId: ID!) {
      archivedCards(boardId: $boardId) {
        id
        title
        description
        listId
        position
        isArchived
        createdAt
        updatedAt
      }
    }
  `;
  const result = await graphqlRequest<{ archivedCards: Card[] }>(query, { boardId });
  return result.archivedCards ?? [];
}
