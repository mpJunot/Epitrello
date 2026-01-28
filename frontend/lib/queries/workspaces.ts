'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  getMyWorkspaces,
  getWorkspace,
  getWorkspaceBoards,
  getWorkspaceMembers,
  getWorkspaceInvitations,
  getMyInvitations,
  type Workspace,
  type GqlBoard,
  type WorkspaceMemberWithUser,
} from '@/lib/actions/workspaces';
import type { WorkspaceInvitation } from '@/lib/graphql-types';

// --- Workspaces (list)

export const workspacesQueryKey = ['workspaces'] as const;

export function useWorkspacesQuery(enabled = true) {
  return useQuery({
    queryKey: workspacesQueryKey,
    queryFn: () => getMyWorkspaces(),
    enabled,
  });
}

// --- Workspace (detail)

export const workspaceQueryKey = (id: string) => ['workspace', id] as const;

export function workspaceQueryOptions(workspaceId: string) {
  return {
    queryKey: workspaceQueryKey(workspaceId),
    queryFn: () => getWorkspace(workspaceId),
    enabled: !!workspaceId,
  };
}

export function useWorkspaceQuery(workspaceId: string): UseQueryResult<Workspace | undefined> {
  return useQuery(workspaceQueryOptions(workspaceId));
}

// --- Workspace members

export const workspaceBoardsQueryKey = (workspaceId: string) =>
  ['workspace', workspaceId, 'boards'] as const;

export function workspaceBoardsQueryOptions(workspaceId: string) {
  return {
    queryKey: workspaceBoardsQueryKey(workspaceId),
    queryFn: () => getWorkspaceBoards(workspaceId),
    enabled: !!workspaceId,
  };
}

export function useWorkspaceBoardsQuery(
  workspaceId: string
): UseQueryResult<GqlBoard[] | undefined> {
  return useQuery(workspaceBoardsQueryOptions(workspaceId));
}

// --- Workspace members

export const workspaceMembersQueryKey = (workspaceId: string) =>
  ['workspace', workspaceId, 'members'] as const;

export function useWorkspaceMembersQuery(
  workspaceId: string
): UseQueryResult<WorkspaceMemberWithUser[] | undefined> {
  return useQuery({
    queryKey: workspaceMembersQueryKey(workspaceId),
    queryFn: () => getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

// --- Workspace invitations

export const workspaceInvitationsQueryKey = (workspaceId: string) =>
  ['workspace', workspaceId, 'invitations'] as const;

export function workspaceInvitationsQueryOptions(workspaceId: string) {
  return {
    queryKey: workspaceInvitationsQueryKey(workspaceId),
    queryFn: () => getWorkspaceInvitations(workspaceId),
    enabled: !!workspaceId,
  };
}

export function useWorkspaceInvitationsQuery(
  workspaceId: string,
  options?: { enabled?: boolean }
): UseQueryResult<WorkspaceInvitation[] | undefined> {
  return useQuery({
    ...workspaceInvitationsQueryOptions(workspaceId),
    enabled: options?.enabled !== false,
    retry: false,
  });
}

// --- My invitations (for current user)

export const myInvitationsQueryKey = ['myInvitations'] as const;

export function myInvitationsQueryOptions() {
  return {
    queryKey: myInvitationsQueryKey,
    queryFn: () => getMyInvitations(),
  };
}

export function useMyInvitationsQuery(): UseQueryResult<
  WorkspaceInvitation[] | undefined
> {
  return useQuery(myInvitationsQueryOptions());
}
