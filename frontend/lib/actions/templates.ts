import { graphqlRequest } from '../graphql-client';
import type {
  CreateTemplateInput,
  Template,
  UpdateTemplateInput,
  Visibility,
} from '@/lib/graphql-types';

export type { CreateTemplateInput, Template, UpdateTemplateInput, Visibility };

/**
 * Fetch custom templates. If workspaceId is provided, returns global + workspace templates.
 */
export async function getTemplates(workspaceId: string | null): Promise<Template[]> {
  const query = `
    query Templates($workspaceId: ID) {
      templates(workspaceId: $workspaceId) {
        id
        name
        description
        lists { title position sampleCards { title position } }
        visibility
        workspaceId
        creatorId
        createdAt
        updatedAt
      }
    }
  `;
  const result = await graphqlRequest<{ templates: Template[] }>(query, { workspaceId });
  return result.templates;
}

/**
 * Fetch a single template by id.
 */
export async function getTemplate(id: string): Promise<Template> {
  const query = `
    query Template($id: ID!) {
      template(id: $id) {
        id
        name
        description
        lists { title position sampleCards { title position } }
        visibility
        workspaceId
        creatorId
        createdAt
        updatedAt
      }
    }
  `;
  const result = await graphqlRequest<{ template: Template }>(query, { id });
  if (!result?.template) {
    throw new Error('Template not found');
  }
  return result.template;
}

/**
 * Create a custom board template.
 */
export async function createTemplate(input: CreateTemplateInput): Promise<Template> {
  const mutation = `
    mutation CreateTemplate($input: CreateTemplateInput!) {
      createTemplate(input: $input) {
        id
        name
        description
        lists { title position sampleCards { title position } }
        visibility
        workspaceId
        creatorId
        createdAt
        updatedAt
      }
    }
  `;
  const result = await graphqlRequest<{ createTemplate: Template }>(mutation, { input });
  return result.createTemplate;
}

/**
 * Update a custom template.
 */
export async function updateTemplate(input: UpdateTemplateInput): Promise<Template> {
  const mutation = `
    mutation UpdateTemplate($input: UpdateTemplateInput!) {
      updateTemplate(input: $input) {
        id
        name
        description
        lists { title position sampleCards { title position } }
        visibility
        workspaceId
        creatorId
        createdAt
        updatedAt
      }
    }
  `;
  const result = await graphqlRequest<{ updateTemplate: Template }>(mutation, { input });
  return result.updateTemplate;
}

/**
 * Delete a custom template.
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  const mutation = `
    mutation DeleteTemplate($id: ID!) {
      deleteTemplate(id: $id)
    }
  `;
  const result = await graphqlRequest<{ deleteTemplate: boolean }>(mutation, { id });
  return result.deleteTemplate;
}

/**
 * Create a template from an existing board (lists and cards become template structure).
 */
export async function createTemplateFromBoard(
  boardId: string,
  name?: string | null,
): Promise<Template> {
  const mutation = `
    mutation CreateTemplateFromBoard($boardId: ID!, $name: String) {
      createTemplateFromBoard(boardId: $boardId, name: $name) {
        id
        name
        description
        lists { title position sampleCards { title position } }
        visibility
        workspaceId
        creatorId
        createdAt
        updatedAt
      }
    }
  `;
  const result = await graphqlRequest<{ createTemplateFromBoard: Template }>(mutation, {
    boardId,
    name: name ?? undefined,
  });
  return result.createTemplateFromBoard;
}
