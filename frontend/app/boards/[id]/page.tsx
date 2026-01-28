'use client';

import { use } from 'react';
import BoardView from '@/components/BoardView';
import { useBoardData } from './hooks';
import { useEventListeners } from './useEventListeners';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { BoardHeader } from './components/BoardHeader';
import { Board } from './types';

export default function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const isImageBackground =
    !!board.background &&
    (board.background.startsWith('data:image') ||
      board.background.startsWith('http') ||
      board.background.startsWith('https'));

  return (
    <div
      className={`h-screen w-full ${
        !isImageBackground ? board.background || 'bg-primary' : ''
      }`}
      style={
        isImageBackground
          ? {
              backgroundImage: `url(${board.background})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : undefined
      }
    >
      <BoardHeader board={composedBoard} />
      <main className='h-full'>
        <BoardView board={composedBoard} />
      </main>
    </div>
  );
}
