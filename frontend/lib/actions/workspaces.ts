import { graphqlRequest } from '../graphql-client';

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  logoUrl?: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'WORKSPACE';
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  memberships: WorkspaceMember[];
}

// GraphQL Board shape (backend fields)
export interface GqlBoard {
  id: string;
  title: string;
  description?: string;
  background?: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'WORKSPACE';
  workspaceId?: string;
  members?: { id: string }[];
}

/**
 * Get all workspaces for current user
 */
export async function getMyWorkspaces(): Promise<Workspace[]> {
  const query = `
    query MyWorkspaces {
      myWorkspaces {
        id
        name
        logoUrl
        visibility
        memberCount
        createdAt
        updatedAt
        memberships {
          id
          userId
          role
          joinedAt
        }
      }
    }
  `;

  const result = await graphqlRequest<{ myWorkspaces: Workspace[] }>(query);
  return result.myWorkspaces;
}

/**
 * Create a new workspace
 */
export async function createWorkspace(input: {
  name: string;
  logoUrl?: string;
  visibility?: string;
}): Promise<Workspace> {
  const query = `
    mutation CreateWorkspace($input: CreateWorkspaceInput!) {
      createWorkspace(input: $input) {
        id
        name
        logoUrl
        visibility
        memberCount
        createdAt
        updatedAt
        memberships {
          id
          userId
          role
          joinedAt
        }
      }
    }
  `;

  const result = await graphqlRequest<{ createWorkspace: Workspace }>(query, { input });
  return result.createWorkspace;
}

/**
 * Get boards for a specific workspace (backend integration)
 */
export async function getWorkspaceBoards(workspaceId: string): Promise<GqlBoard[]> {
  const query = `
    query WorkspaceBoards($workspaceId: ID!) {
      workspaceBoards(workspaceId: $workspaceId) {
        id
        title
        description
        background
        visibility
        workspaceId
        members { id }
      }
    }
  `;

  const result = await graphqlRequest<{ workspaceBoards: GqlBoard[] }>(query, { workspaceId });
  return result.workspaceBoards;
}

/**
 * Get a workspace by ID (backend integration)
 */
export async function getWorkspace(id: string): Promise<Workspace> {
  const query = `
    query Workspace($id: ID!) {
      workspace(id: $id) {
        id
        name
        logoUrl
        visibility
        memberCount
        createdAt
        updatedAt
        memberships {
          id
          userId
          role
          joinedAt
        }
      }
    }
  `;

  const result = await graphqlRequest<{ workspace: Workspace }>(query, { id });
  return result.workspace;
}
