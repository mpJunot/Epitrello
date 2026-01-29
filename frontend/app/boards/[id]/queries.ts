'use client';

import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { getBoard } from '@/lib/actions/boards';
import { List, Board, type Card } from './types';
import { logAction } from './utils';

export const boardQueryKey = (boardId: string) => ['board', boardId] as const;

function mapBoardLists(data: Awaited<ReturnType<typeof getBoard>>): List[] {
  if (!data?.lists) return [];
  return data.lists.map((list) => ({
    id: list.id,
    title: list.title,
    position: list.position,
    isArchived: (list as { isArchived?: boolean }).isArchived ?? false,
    cards: [...(list.cards ?? [])]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((card) => {
        const c = card as {
          dueDate?: string;
          startDate?: string;
          assignees?: unknown;
          labels?: { id: string; name?: string | null; color: string }[];
          checklists?: {
            id: string;
            title: string;
            items?: { id: string; checked: boolean; content: string; position: number; checklistId: string }[];
          }[];
        };
        const mappedChecklists = c.checklists?.map((checklist) => ({
          ...checklist,
          items: checklist.items?.map((item) => ({
            ...item,
            text: item.content,
          })),
        }));

        return {
          id: card.id,
          title: card.title,
          description: card.description ?? undefined,
          position: card.position ?? 0,
          listId: list.id,
          background: (card as { background?: string }).background ?? undefined,
          dueDate: c.dueDate ?? undefined,
          startDate: c.startDate ?? undefined,
          completed: card.completed ?? false,
          createdAt: (card as { createdAt?: string }).createdAt,
          assignees:
            c.assignees && Array.isArray(c.assignees) ? (c.assignees as Card['assignees']) : undefined,
          labels: c.labels ?? undefined,
          checklists: mappedChecklists ?? undefined,
        } as Card;
      }),
  }));
}

export function boardQueryOptions(boardId: string) {
  return {
    queryKey: boardQueryKey(boardId),
    queryFn: async (): Promise<Board> => {
      logAction('📥', 'Fetching board from backend:', boardId);
      const data = await getBoard(boardId);
      if (!data) throw new Error('Board not found');
      logAction('✅', 'Board fetched successfully');
      const mappedLists = mapBoardLists(data);
      return {
        ...data,
        members: data.members ?? undefined,
        lists: mappedLists,
      };
    },
  };
}

export function useBoardQuery(boardId: string): UseQueryResult<Board | undefined> {
  return useQuery({
    ...boardQueryOptions(boardId),
    enabled: !!boardId,
  });
}

export type SetLists = React.Dispatch<React.SetStateAction<List[]>>;

/**
 * Creates a setLists function that updates the TanStack Query cache.
 * Used by event handlers for optimistic updates.
 */
export function useSetListsFromCache(boardId: string): SetLists {
  const queryClient = useQueryClient();

  return useCallback<SetLists>(
    (arg) => {
      queryClient.setQueryData<Board>(boardQueryKey(boardId), (old) => {
        if (!old) return old;
        const prev = old.lists ?? [];
        const next =
          typeof arg === 'function' ? (arg as (prev: List[]) => List[])(prev) : arg;
        return { ...old, lists: next };
      });
    },
    [queryClient, boardId]
  );
}
