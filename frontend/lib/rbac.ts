/**
 * Role-Based Access Control (RBAC) for workspaces.
 * Aligned with backend: Prisma Role (ADMIN, MEMBER, OBSERVER).
 */

export const WORKSPACE_ROLES = ['ADMIN', 'MEMBER', 'OBSERVER'] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export function isWorkspaceRole(value: string): value is WorkspaceRole {
  return WORKSPACE_ROLES.includes(value as WorkspaceRole);
}

export interface WorkspacePermissions {
  /** Update workspace settings (name, description, visibility) */
  canUpdateWorkspace: boolean;
  /** Delete the workspace */
  canDeleteWorkspace: boolean;
  /** Invite members and manage invite link */
  canInviteMembers: boolean;
  /** Remove members from the workspace */
  canRemoveMembers: boolean;
  /** View and manage pending invitations (Requests tab) */
  canViewPendingInvitations: boolean;
  /** Summary: all admin-only actions (alias for canUpdateWorkspace) */
  canManageWorkspace: boolean;
}

/**
 * Computes permissions from the workspace role (backend: ADMIN, MEMBER, OBSERVER).
 */
export function getWorkspacePermissions(role: WorkspaceRole | string | null): WorkspacePermissions {
  const isAdmin = role === 'ADMIN';
  return {
    canUpdateWorkspace: isAdmin,
    canDeleteWorkspace: isAdmin,
    canInviteMembers: isAdmin,
    canRemoveMembers: isAdmin,
    canViewPendingInvitations: isAdmin,
    canManageWorkspace: isAdmin,
  };
}
