'use client';

import { useQuery } from '@tanstack/react-query';
import { getBoardLabels } from '@/lib/actions/labels';

export const boardLabelsQueryKey = (boardId: string) =>
  ['board', boardId, 'labels'] as const;

export function useBoardLabelsQuery(boardId: string, enabled: boolean) {
  return useQuery({
    queryKey: boardLabelsQueryKey(boardId),
    queryFn: () => getBoardLabels(boardId),
    enabled: !!boardId && enabled,
  });
}
