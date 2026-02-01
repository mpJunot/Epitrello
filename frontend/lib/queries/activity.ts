'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getMyActivity,
  getBoardActivity,
  type MyActivityInput,
} from '@/lib/actions/activity';

export const activityQueryKey = (input?: MyActivityInput) =>
  ['activity', input?.workspaceIds ?? null, input?.cursor ?? 'initial'] as const;

export function useMyActivityQuery(input?: MyActivityInput) {
  return useQuery({
    queryKey: activityQueryKey(input),
    queryFn: () => getMyActivity(input),
    staleTime: 30 * 1000,
  });
}

export const activityInfiniteQueryKey = (workspaceIds?: string[]) =>
  ['activityInfinite', workspaceIds ?? null] as const;

/** Invalidate to refetch the Activity page. */
export const activityInvalidateKey = ['activityInfinite'] as const;

/** Invalidate to refetch board header activity popover(s). */
export const activityBoardInvalidateKey = ['activity'] as const;

/**
 * Infinite query for Activity page: first page, then "Load more" via fetchNextPage.
 */
export function useActivityInfiniteQuery(workspaceIds?: string[]) {
  return useInfiniteQuery({
    queryKey: activityInfiniteQueryKey(workspaceIds),
    queryFn: ({ pageParam }) =>
      getMyActivity({ limit: 20, cursor: pageParam as string | undefined, workspaceIds }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined),
    staleTime: 30 * 1000,
  });
}

export const boardActivityQueryKey = (boardId: string) =>
  ['activity', 'board', boardId] as const;

/**
 * Activity for a single board (all members). Used in board header popover.
 */
export function useBoardActivityQuery(boardId: string, enabled: boolean) {
  return useQuery({
    queryKey: boardActivityQueryKey(boardId),
    queryFn: () => getBoardActivity(boardId, { limit: 50 }),
    enabled: !!boardId && enabled,
    staleTime: 30 * 1000,
  });
}
