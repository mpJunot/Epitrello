'use client';

import { use } from 'react';
import BoardView from '@/components/BoardView';
import { useBoardData } from './hooks';
import { useEventListeners } from './useEventListeners';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { BoardHeader } from './components/BoardHeader';
import { Board } from './types';

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: boardId } = use(params);
  const { board, lists, setLists, loading, error } = useBoardData(boardId);

  useEventListeners(boardId, setLists);

  if (loading) {
    return <LoadingState />;
  }

  if (error || board === null) {
    return <ErrorState error={error} />;
  }

  const composedBoard: Board = { ...board, lists };

  return (
    <div className={`h-full w-full ${board.background} border-2 border-green-500`}>
      <BoardHeader board={board} />
      <main className="p-1">
        <BoardView board={composedBoard} />
      </main>
    </div>
  );
}
