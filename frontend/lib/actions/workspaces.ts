import { graphqlRequest } from '../graphql-client';
import type {
  Workspace as GqlWorkspace,
  UpdateWorkspaceInput as GqlUpdateWorkspaceInput,
  CreateWorkspaceInput as GqlCreateWorkspaceInput,
  WorkspaceMember as GqlWorkspaceMember,
  WorkspaceMemberWithUser as GqlWorkspaceMemberWithUser,
  Visibility,
} from '../graphql-types';

export type Workspace = Omit<GqlWorkspace, 'memberships'> & {
  description?: string | null;
  memberships: WorkspaceMember[];
};

export type UpdateWorkspaceInput = GqlUpdateWorkspaceInput & {
  description?: string | null;
};

export type CreateWorkspaceInput = GqlCreateWorkspaceInput & {
  description?: string | null;
};

export type WorkspaceMember = GqlWorkspaceMember;

export type WorkspaceMemberWithUser = GqlWorkspaceMemberWithUser;

export type { Visibility };

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
        description
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
        description
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
        description
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

/**
 * Get all members of a workspace
 */
export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberWithUser[]> {
  const query = `
    query WorkspaceMembers($workspaceId: ID!) {
      workspaceMembers(workspaceId: $workspaceId) {
        id
        userId
        workspaceId
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

  const result = await graphqlRequest<{ workspaceMembers: WorkspaceMemberWithUser[] }>(query, { workspaceId });
  return result.workspaceMembers;
}

/**
 * Update a workspace
 */
export async function updateWorkspace(id: string, input: UpdateWorkspaceInput): Promise<Workspace> {
  const mutation = `
    mutation UpdateWorkspace($id: ID!, $input: UpdateWorkspaceInput!) {
      updateWorkspace(id: $id, input: $input) {
        id
        name
        logoUrl
        description
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

  const result = await graphqlRequest<{ updateWorkspace: Workspace }>(mutation, { id, input });
  return result.updateWorkspace;
}

/**
 * Invite a member to a workspace
 */
export async function inviteMember(workspaceId: string, inviteeEmail: string, role: string = 'MEMBER'): Promise<{ id: string; inviteeEmail: string; status: string }> {
  const mutation = `
    mutation InviteMember($input: InviteMemberInput!) {
      inviteMember(input: $input) {
        id
        inviteeEmail
        status
      }
    }
  `;

  const result = await graphqlRequest<{ inviteMember: { id: string; inviteeEmail: string; status: string } }>(mutation, {
    input: { workspaceId, inviteeEmail, role },
  });
  return result.inviteMember;
}

/**
 * Remove a member from a workspace
 */
export async function removeMember(workspaceId: string, userId: string): Promise<boolean> {
  const mutation = `
    mutation RemoveMember($input: RemoveMemberInput!) {
      removeMember(input: $input)
    }
  `;

  const result = await graphqlRequest<{ removeMember: boolean }>(mutation, {
    input: { workspaceId, userId },
  });
  return result.removeMember;
}
