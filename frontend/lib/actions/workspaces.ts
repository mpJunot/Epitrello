import { graphqlRequest } from '../graphql-client';
import type {
  Workspace as GqlWorkspace,
  UpdateWorkspaceInput as GqlUpdateWorkspaceInput,
  CreateWorkspaceInput as GqlCreateWorkspaceInput,
  WorkspaceMember as GqlWorkspaceMember,
  WorkspaceMemberWithUser as GqlWorkspaceMemberWithUser,
  WorkspaceInvitation,
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
  members?: { id: string; userId: string }[];
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
        members { id userId }
      }
    }
  `;

  const result = await graphqlRequest<{ workspaceBoards: GqlBoard[] }>(query, { workspaceId });
  return result.workspaceBoards;
}

/**
 * Get workspace invite info (id, name, logoUrl) for the invite link page.
 * Public query – no auth required.
 */
export async function getWorkspaceInviteInfo(
  workspaceId: string,
): Promise<{ id: string; name: string; logoUrl?: string }> {
  const query = `
    query WorkspaceInviteInfo($workspaceId: ID!) {
      workspaceInviteInfo(workspaceId: $workspaceId) {
        id
        name
        logoUrl
      }
    }
  `;
  const result = await graphqlRequest<{
    workspaceInviteInfo: { id: string; name: string; logoUrl?: string };
  }>(query, { workspaceId });
  return result.workspaceInviteInfo;
}

/**
 * Join a workspace via invite link (adds current user as MEMBER).
 */
export async function joinWorkspaceByInviteLink(
  workspaceId: string,
): Promise<boolean> {
  const mutation = `
    mutation JoinWorkspaceByInviteLink($workspaceId: ID!) {
      joinWorkspaceByInviteLink(workspaceId: $workspaceId)
    }
  `;
  const result = await graphqlRequest<{
    joinWorkspaceByInviteLink: boolean;
  }>(mutation, { workspaceId });
  return result.joinWorkspaceByInviteLink;
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
 * Delete a workspace by ID (only ADMIN can delete)
 */
export async function deleteWorkspace(id: string): Promise<boolean> {
  const mutation = `
    mutation DeleteWorkspace($id: ID!) {
      deleteWorkspace(id: $id)
    }
  `;
  const result = await graphqlRequest<{ deleteWorkspace: boolean }>(mutation, { id });
  return result.deleteWorkspace;
}

/**
 * Invite a member to a workspace
 */
export async function inviteMember(workspaceId: string, inviteeEmail: string, role: string = 'MEMBER'): Promise<WorkspaceInvitation> {
  const mutation = `
    mutation InviteMember($input: InviteMemberInput!) {
      inviteMember(input: $input) {
        id
        workspaceId
        inviteeEmail
        inviteeId
        inviterId
        inviterName
        role
        status
        expiresAt
        createdAt
        updatedAt
        workspaceName
      }
    }
  `;

  const result = await graphqlRequest<{ inviteMember: WorkspaceInvitation }>(mutation, {
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

/**
 * Update a member's role in a workspace (admin only).
 * Cannot remove the last ADMIN.
 */
export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: string,
): Promise<boolean> {
  const mutation = `
    mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {
      updateMemberRole(input: $input)
    }
  `;
  const result = await graphqlRequest<{ updateMemberRole: boolean }>(mutation, {
    input: { workspaceId, userId, role },
  });
  return result.updateMemberRole;
}

/**
 * Get pending invitations for a workspace (admin only)
 */
export async function getWorkspaceInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
  const query = `
    query WorkspaceInvitations($workspaceId: ID!) {
      workspaceInvitations(workspaceId: $workspaceId) {
        id
        workspaceId
        inviteeEmail
        inviteeId
        inviterId
        inviterName
        role
        status
        expiresAt
        createdAt
        updatedAt
        workspaceName
      }
    }
  `;

  const result = await graphqlRequest<{ workspaceInvitations: WorkspaceInvitation[] }>(query, { workspaceId });
  return result.workspaceInvitations;
}

/**
 * Get current user's pending invitations
 */
export async function getMyInvitations(): Promise<WorkspaceInvitation[]> {
  const query = `
    query MyInvitations {
      myInvitations {
        id
        workspaceId
        inviteeEmail
        inviteeId
        inviterId
        inviterName
        role
        status
        expiresAt
        createdAt
        updatedAt
        workspaceName
      }
    }
  `;

  const result = await graphqlRequest<{ myInvitations: WorkspaceInvitation[] }>(query);
  return result.myInvitations;
}

/**
 * Accept a workspace invitation
 */
export async function acceptInvitation(invitationId: string): Promise<WorkspaceInvitation> {
  const mutation = `
    mutation AcceptInvitation($input: RespondInvitationInput!) {
      acceptInvitation(input: $input) {
        id
        workspaceId
        inviteeEmail
        inviteeId
        inviterId
        inviterName
        role
        status
        expiresAt
        createdAt
        updatedAt
        workspaceName
      }
    }
  `;

  const result = await graphqlRequest<{ acceptInvitation: WorkspaceInvitation }>(mutation, {
    input: { invitationId },
  });
  return result.acceptInvitation;
}

/**
 * Reject a workspace invitation
 */
export async function rejectInvitation(invitationId: string): Promise<WorkspaceInvitation> {
  const mutation = `
    mutation RejectInvitation($input: RespondInvitationInput!) {
      rejectInvitation(input: $input) {
        id
        workspaceId
        inviteeEmail
        inviteeId
        inviterId
        inviterName
        role
        status
        expiresAt
        createdAt
        updatedAt
        workspaceName
      }
    }
  `;

  const result = await graphqlRequest<{ rejectInvitation: WorkspaceInvitation }>(mutation, {
    input: { invitationId },
  });
  return result.rejectInvitation;
}

/**
 * Leave a workspace (current user removes themselves).
 */
export async function leaveWorkspace(workspaceId: string): Promise<boolean> {
  const mutation = `
    mutation LeaveWorkspace($workspaceId: ID!) {
      leaveWorkspace(workspaceId: $workspaceId)
    }
  `;
  const result = await graphqlRequest<{ leaveWorkspace: boolean }>(mutation, {
    workspaceId,
  });
  return result.leaveWorkspace;
}
