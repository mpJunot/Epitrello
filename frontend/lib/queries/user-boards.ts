'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getMyWorkspaces,
  getWorkspaceBoards,
  type Workspace,
  type GqlBoard,
} from '@/lib/actions/workspaces';

export const allUserBoardsQueryKey = ['user', 'all-boards'] as const;

export function useAllUserBoardsQuery() {
  return useQuery({
    queryKey: allUserBoardsQueryKey,
    queryFn: async () => {
      const workspaces: Workspace[] = await getMyWorkspaces();
      const boardsPromises = workspaces.map(async (workspace: Workspace) => {
        try {
          const gqlBoards: GqlBoard[] = await getWorkspaceBoards(workspace.id);
          return gqlBoards.map((b: GqlBoard) => ({
            id: b.id,
            name: b.title,
            workspaceId: workspace.id,
            workspaceName: workspace.name,
          }));
        } catch {
          return [];
        }
      });
      const boardsArrays = await Promise.all(boardsPromises);
      return boardsArrays.flat();
    },
  });
}
