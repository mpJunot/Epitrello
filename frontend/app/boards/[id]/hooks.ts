import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBoard } from '@/lib/actions/boards';
import { List, Board, Card } from './types';
import { logAction } from './utils';

export function useBoardData(boardId: string) {
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadBoard() {
      try {
        logAction('📥', 'Fetching board from backend:', boardId);
        const data = await getBoard(boardId);

        if (!data) {
          throw new Error('Board not found');
        }

        logAction('✅', 'Board fetched successfully');
        const mappedLists: List[] = (data.lists || []).map(list => ({
          id: list.id,
          title: list.title,
          position: list.position,
          cards: list.cards?.map((card: Card) => ({
            id: card.id,
            title: card.title,
            description: card.description ?? undefined,
            position: card.position ?? 0,
            listId: list.id,
            completed: card.completed ?? false,
          })),
        }));
        setBoard({
          ...data,
          members: data.members ?? undefined,
          lists: mappedLists,
        });
        setLists(mappedLists);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load board';;
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadBoard();
  }, [boardId, router]);

  return { board, lists, setLists, loading, error };
}
