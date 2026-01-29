'use client';

import { useMemo } from 'react';
import { useWorkspaceMembersQuery } from '@/lib/queries/workspaces';
import { useCurrentUserQuery } from '@/lib/queries/users';
import {
  getWorkspacePermissions,
  isWorkspaceRole,
  type WorkspaceRole,
  type WorkspacePermissions,
} from '@/lib/rbac';

export interface UseWorkspaceRoleResult {
  /** Current user's role in the workspace, or null if not a member / not loaded */
  role: WorkspaceRole | null;
  /** Permissions derived from the role */
  permissions: WorkspacePermissions;
  /** True when members or currentUser data is still loading */
  isLoading: boolean;
  /** True if the user is a member of the workspace (with a recognized role) */
  isMember: boolean;
  /** Shortcut: true when role === ADMIN */
  isAdmin: boolean;
}

/**
 * Returns the current user's role and permissions in the given workspace.
 * Uses workspaceMembers + currentUser to derive the role.
 */
export function useWorkspaceRole(workspaceId: string): UseWorkspaceRoleResult {
  const { data: members, isLoading: loadingMembers } =
    useWorkspaceMembersQuery(workspaceId);
  const { data: currentUser, isLoading: loadingUser } = useCurrentUserQuery();

  return useMemo(() => {
    const isLoading = loadingMembers || loadingUser;
    if (!currentUser || !members?.length) {
      return {
        role: null,
        permissions: getWorkspacePermissions(null),
        isLoading,
        isMember: false,
        isAdmin: false,
      };
    }
    const membership = members.find((m) => m.user.id === currentUser.id);
    const roleRaw = membership?.role ?? null;
    const role: WorkspaceRole | null =
      roleRaw && isWorkspaceRole(roleRaw) ? roleRaw : null;
    return {
      role,
      permissions: getWorkspacePermissions(role),
      isLoading,
      isMember: role !== null,
      isAdmin: role === 'ADMIN',
    };
  }, [currentUser, members, loadingMembers, loadingUser]);
}
