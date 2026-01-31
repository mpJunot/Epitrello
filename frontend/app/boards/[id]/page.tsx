'use client';

import { useMemo, use, useState, useCallback, useEffect, useRef } from 'react';
import BoardView from '@/components/BoardView';
import { useBoardData } from './hooks';
import { useEventListeners } from './useEventListeners';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { BoardHeader } from './components/BoardHeader';
import {
  Board,
  BoardFilterState,
  DEFAULT_BOARD_FILTER,
  applyBoardFilter,
  hasActiveFilter,
  getBoardFilterStorageKey,
  parseStoredBoardFilter,
} from './types';
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

  useEventListeners(boardId, setLists, () => lists, queryClient);

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

  const [filterState, setFilterState] =
    useState<BoardFilterState>(DEFAULT_BOARD_FILTER);
  const hasLoadedFilterFromStorage = useRef(false);

  useEffect(() => {
    if (!boardId || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(getBoardFilterStorageKey(boardId));
      const stored = parseStoredBoardFilter(raw);
      if (stored) setFilterState(stored);
    } catch {
      // ignore
    } finally {
      hasLoadedFilterFromStorage.current = true;
    }
  }, [boardId]);

  useEffect(() => {
    if (
      !boardId ||
      typeof window === 'undefined' ||
      !hasLoadedFilterFromStorage.current
    )
      return;
    try {
      localStorage.setItem(
        getBoardFilterStorageKey(boardId),
        JSON.stringify(filterState),
      );
    } catch {
      // ignore
    }
  }, [boardId, filterState]);

  const onFilterChange = useCallback((updates: Partial<BoardFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  }, []);
  const onClearFilters = useCallback(() => {
    setFilterState(DEFAULT_BOARD_FILTER);
  }, []);

  const composedBoard = useMemo<Board | null>(
    () => (board != null ? { ...board, lists } : null),
    [board, lists],
  );
  const filteredBoard = useMemo(
    () =>
      composedBoard != null
        ? applyBoardFilter(composedBoard, filterState, currentUser?.id)
        : null,
    [composedBoard, filterState, currentUser?.id],
  );
  const filteredCardCount = useMemo(
    () =>
      (filteredBoard ?? composedBoard)?.lists?.reduce(
        (acc, list) => acc + (list.cards?.length ?? 0),
        0,
      ) ?? 0,
    [filteredBoard, composedBoard],
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error || board === null) {
    return <ErrorState error={error} />;
  }

  const boardToShow = filteredBoard ?? composedBoard!;
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
        board={composedBoard!}
        canEdit={canEdit}
        onVisibilityChange={handleVisibilityChange}
        onMemberAdded={handleMemberAdded}
        filterState={filterState}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        currentUserId={currentUser?.id}
        filteredCardCount={filteredCardCount}
      />
      <main className='h-full flex flex-col'>
        {hasActiveFilter(filterState) &&
          (boardToShow.lists ?? []).every(
            (list) => (list.cards?.length ?? 0) === 0,
          ) && (
            <div className='flex items-center justify-center gap-2 px-4 py-2 bg-muted/80 text-muted-foreground text-sm shrink-0'>
              <span>No cards match the current filters.</span>
              <button
                type='button'
                onClick={onClearFilters}
                className='underline font-medium hover:text-foreground'
              >
                Clear filters
              </button>
            </div>
          )}
        <div className='flex-1 min-h-0'>
          <BoardView board={boardToShow} canEdit={canEdit} />
        </div>
      </main>
    </div>
  );
}
