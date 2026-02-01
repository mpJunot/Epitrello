'use client';

import { useBoardQuery, useSetListsFromCache } from './queries';
import { useAllUserBoardsQuery } from '@/lib/queries/user-boards';

export function useBoardData(boardId: string) {
  const { data, isLoading, error } = useBoardQuery(boardId);
  const setLists = useSetListsFromCache(boardId);

  return {
    board: data ?? null,
    lists: data?.lists ?? [],
    setLists,
    loading: isLoading,
    error: error?.message ?? null,
  };
}

/**
 * Hook pour charger tous les boards de l'utilisateur (tous workspaces).
 * Utilise TanStack Query pour le cache et la synchronisation.
 */
export function useAllUserBoards() {
  const { data, isLoading, error } = useAllUserBoardsQuery();

  return {
    allBoards: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}
