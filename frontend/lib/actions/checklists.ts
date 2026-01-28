import { graphqlRequest } from '../graphql-client';
import type {
  Checklist,
  ChecklistItem,
  CreateChecklistInput,
  UpdateChecklistInput,
  AddChecklistItemInput,
  UpdateChecklistItemInput,
} from '../graphql-types';

export async function createChecklist(
  input: CreateChecklistInput,
): Promise<Checklist> {
  const mutation = `
    mutation CreateChecklist($input: CreateChecklistInput!) {
      createChecklist(input: $input) {
        id
        title
        cardId
        items {
          id
          content
          checked
          position
          checklistId
        }
      }
    }
  `;

  const result = await graphqlRequest<{ createChecklist: Checklist }>(
    mutation,
    { input },
  );
  return result.createChecklist;
}

export async function updateChecklist(
  input: UpdateChecklistInput,
): Promise<Checklist> {
  const mutation = `
    mutation UpdateChecklist($input: UpdateChecklistInput!) {
      updateChecklist(input: $input) {
        id
        title
        cardId
        items {
          id
          content
          checked
          position
          checklistId
        }
      }
    }
  `;

  const result = await graphqlRequest<{ updateChecklist: Checklist }>(
    mutation,
    { input },
  );
  return result.updateChecklist;
}

export async function deleteChecklist(id: string): Promise<boolean> {
  const mutation = `
    mutation DeleteChecklist($id: ID!) {
      deleteChecklist(id: $id)
    }
  `;

  const result = await graphqlRequest<{ deleteChecklist: boolean }>(mutation, {
    id,
  });
  return result.deleteChecklist;
}

export async function addChecklistItem(
  input: AddChecklistItemInput,
): Promise<ChecklistItem> {
  const mutation = `
    mutation AddChecklistItem($input: AddChecklistItemInput!) {
      addChecklistItem(input: $input) {
        id
        content
        checked
        position
        checklistId
      }
    }
  `;

  const result = await graphqlRequest<{ addChecklistItem: ChecklistItem }>(
    mutation,
    { input },
  );
  return result.addChecklistItem;
}

export async function updateChecklistItem(
  input: UpdateChecklistItemInput,
): Promise<ChecklistItem> {
  const mutation = `
    mutation UpdateChecklistItem($input: UpdateChecklistItemInput!) {
      updateChecklistItem(input: $input) {
        id
        content
        checked
        position
        checklistId
      }
    }
  `;

  const result = await graphqlRequest<{ updateChecklistItem: ChecklistItem }>(
    mutation,
    { input },
  );
  return result.updateChecklistItem;
}

export async function deleteChecklistItem(id: string): Promise<boolean> {
  const mutation = `
    mutation DeleteChecklistItem($id: ID!) {
      deleteChecklistItem(id: $id)
    }
  `;

  const result = await graphqlRequest<{ deleteChecklistItem: boolean }>(
    mutation,
    { id },
  );
  return result.deleteChecklistItem;
}
