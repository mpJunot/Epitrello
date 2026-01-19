import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBoard } from '@/lib/actions/boards';
import { List, Board } from './types';
import { logAction, handleAsyncError } from './utils';

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
        setBoard(data);
        setLists(data.lists || []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load board';
        console.error('❌ Failed to load board:', err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadBoard();
  }, [boardId, router]);

  return { board, lists, setLists, loading, error };
}
