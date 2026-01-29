'use client';

import { useMemo, use } from 'react';
import BoardView from '@/components/BoardView';
import { useBoardData } from './hooks';
import { useEventListeners } from './useEventListeners';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { BoardHeader } from './components/BoardHeader';
import { Board } from './types';
import { useQueryClient } from '@tanstack/react-query';
import { boardQueryKey } from './queries';
import { updateBoard } from '@/lib/actions/boards';
import { toast } from '@/lib/toast';
import { useCurrentUserQuery } from '@/lib/queries/users';

export default function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: boardId } = use(params);
  const { board, lists, setLists, loading, error } = useBoardData(boardId);
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUserQuery();

  useEventListeners(boardId, setLists);

  const canEdit = useMemo(() => {
    if (!board?.members || !currentUser?.id) return false;
    const membership = board.members.find((m) => m.userId === currentUser.id);
    if (!membership) return false;
    return membership.role !== 'OBSERVER';
  }, [board, currentUser]);

  const handleVisibilityChange = async (
    visibility: 'PRIVATE' | 'PUBLIC' | 'WORKSPACE',
  ) => {
    if (!boardId) return;
    try {
      await updateBoard({ id: boardId, visibility });
      toast.success('Visibility updated');
      await queryClient.invalidateQueries({ queryKey: boardQueryKey(boardId) });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update visibility';
      toast.error(message);
    }
  };

  const handleMemberAdded = async () => {
    await queryClient.invalidateQueries({ queryKey: boardQueryKey(boardId) });
  };

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
        !isImageBackground ? board.background || 'bg-accent' : 'bg-muted/30'
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
      <BoardHeader
        board={composedBoard}
        canEdit={canEdit}
        onVisibilityChange={handleVisibilityChange}
        onMemberAdded={handleMemberAdded}
      />
      <main className='h-full'>
        <BoardView board={composedBoard} canEdit={canEdit} />
      </main>
    </div>
  );
}
