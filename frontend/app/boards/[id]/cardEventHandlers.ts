import type { QueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import {
  createCard,
  moveCard,
  reorderCards,
  deleteCard,
  archiveCard,
} from '@/lib/actions/cards';
import { List, Card } from './types';
import { boardQueryKey } from './queries';
import { activityInvalidateKey, activityBoardInvalidateKey } from '@/lib/queries/activity';
import { logAction, handleAsyncError } from './utils';

type DetailEvent<T> = CustomEvent<T> | undefined;

export function createCardEventHandlers(
  setLists: Dispatch<SetStateAction<List[]>>,
  getLists?: () => List[],
  queryClient?: QueryClient,
  boardId?: string,
) {
  const invalidateBoard = () => {
    if (boardId) queryClient?.invalidateQueries({ queryKey: boardQueryKey(boardId) });
  };
  const invalidateActivity = () => {
    queryClient?.invalidateQueries({ queryKey: activityInvalidateKey });
    queryClient?.invalidateQueries({ queryKey: activityBoardInvalidateKey });
  };

  let boardSnapshot: List[] = [];

  function handleDragStart(e?: DetailEvent<{ cardId: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId } = detail;
    if (cardId?.startsWith('temp-')) return;
    setLists((prevLists) => {
      boardSnapshot = JSON.parse(JSON.stringify(prevLists));
      return prevLists;
    });
  }

  async function handleCardCreate(e?: DetailEvent<{ listId: string; title: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { listId, title } = detail;

    const tempCard: Card = {
      id: `temp-${Date.now()}`,
      title,
      position: 0,
      listId,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setLists((prevLists) =>
      prevLists.map((l) =>
        l.id === listId ? { ...l, cards: [...(l.cards || []), tempCard] } : l
      )
    );

    try {
      const newCard = await createCard({ listId, title });
      if (!newCard) throw new Error('Failed to create card');
      logAction('✅', 'Card created');
      const createdCard: Card = {
        id: newCard.id,
        title: newCard.title,
        description: newCard.description ?? undefined,
        position: newCard.position ?? 0,
        listId: newCard.listId ?? listId,
        dueDate: newCard.dueDate ?? undefined,
        startDate: newCard.startDate ?? undefined,
        completed: newCard.completed ?? false,
        createdAt: newCard.createdAt ?? new Date().toISOString(),
      };
      setLists((prevLists) =>
        prevLists.map((l) =>
          l.id === listId
            ? {
                ...l,
                cards: (l.cards || [])
                  .filter((c) => !c.id.startsWith('temp-'))
                  .concat(createdCard),
              }
            : l
        )
      );
      invalidateBoard();
    } catch (err) {
      handleAsyncError(err, 'create card');
      setLists((prevLists) =>
        prevLists.map((l) =>
          l.id === listId
            ? { ...l, cards: (l.cards || []).filter((c) => !c.id.startsWith('temp-')) }
            : l
        )
      );
    }
  }

  async function handleCardMove(
    e?: DetailEvent<{
      cardId: string;
      sourceListId: string;
      targetListId: string;
      targetIndex: number;
      fromIndex: number;
    }>
  ) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, sourceListId, targetListId, targetIndex, fromIndex } = detail;

    if (cardId?.startsWith('temp-')) return;

    let targetListCardPositions: { id: string; position: number }[] = [];

    setLists((prevLists) => {
      const sourceList = prevLists.find((l) => l.id === sourceListId);
      const movedCard = sourceList?.cards?.find((c) => c.id === cardId);
      if (!movedCard) return prevLists;

      const isSameList = sourceListId === targetListId;

      if (isSameList) {
        const sourceCards = sourceList!.cards || [];
        const insertIndex = fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
        const newCards = arrayMove(sourceCards, fromIndex, insertIndex);
        targetListCardPositions = newCards.map((c, i) => ({ id: c.id, position: i }));
        return prevLists.map((l) =>
          l.id === sourceListId ? { ...l, cards: newCards } : l
        );
      } else {
        const targetList = prevLists.find((l) => l.id === targetListId);
        const newTargetCards = [...(targetList?.cards || [])];
        newTargetCards.splice(targetIndex, 0, movedCard);
        targetListCardPositions = newTargetCards.map((c, i) => ({ id: c.id, position: i }));
        return prevLists.map((l) => {
          if (l.id === sourceListId) {
            return { ...l, cards: (l.cards || []).filter((c) => c.id !== cardId) };
          }
          if (l.id === targetListId) {
            return { ...l, cards: newTargetCards };
          }
          return l;
        });
      }
    });

    try {
      if (sourceListId !== targetListId) {
        await moveCard({ cardId, targetListId, position: targetIndex });
      }
      await reorderCards({ listId: targetListId, cardPositions: targetListCardPositions });
      logAction('✅', 'Card moved');
      invalidateBoard();
      invalidateActivity();
    } catch (err) {
      handleAsyncError(err, 'move card');
      if (boardSnapshot.length > 0) {
        setLists(() => JSON.parse(JSON.stringify(boardSnapshot)));
      }
    }
  }

  function handleCardTitleUpdate(e?: DetailEvent<{ cardId: string; title: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, title } = detail;
    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) => (c.id === cardId ? { ...c, title } : c)),
      }))
    );
  }

  function handleCardDescriptionUpdate(
    e?: DetailEvent<{ cardId: string; description: string }>
  ) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, description } = detail;
    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, description } : c
        ),
      }))
    );
  }

  function handleCardDueDateUpdate(
    e?: DetailEvent<{ cardId: string; dueDate: string | undefined }>
  ) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, dueDate } = detail;
    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) => (c.id === cardId ? { ...c, dueDate } : c)),
      }))
    );
  }

  function handleCardStartDateUpdate(
    e?: DetailEvent<{ cardId: string; startDate: string | undefined }>
  ) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, startDate } = detail;
    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) => (c.id === cardId ? { ...c, startDate } : c)),
      }))
    );
  }

  function handleCardBackgroundUpdate(
    e?: DetailEvent<{ cardId: string; background: string }>
  ) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, background } = detail;
    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) => (c.id === cardId ? { ...c, background } : c)),
      }))
    );
  }

  function handleCardCompletedUpdate(
    e?: DetailEvent<{ cardId: string; completed: boolean }>
  ) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, completed } = detail;
    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) => (c.id === cardId ? { ...c, completed } : c)),
      }))
    );
  }

  async function handleCardDelete(e?: DetailEvent<{ cardId: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId } = detail;
    setLists((prevLists) =>
      prevLists.map((l) => ({
        ...l,
        cards: (l.cards || []).filter((c) => c.id !== cardId),
      }))
    );
    try {
      await deleteCard(cardId);
      logAction('✅', 'Card deleted');
      invalidateBoard();
      invalidateActivity();
    } catch (err) {
      handleAsyncError(err, 'delete card');
    }
  }

  async function handleCardArchive(e?: DetailEvent<{ cardId: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId } = detail;
    setLists((prevLists) =>
      prevLists.map((l) => ({
        ...l,
        cards: (l.cards || []).filter((c) => c.id !== cardId),
      }))
    );
    try {
      await archiveCard(cardId);
      logAction('✅', 'Card archived');
      invalidateBoard();
      invalidateActivity();
    } catch (err) {
      handleAsyncError(err, 'archive card');
    }
  }

  function handleCardChecklistsUpdate(
    e?: DetailEvent<{ cardId: string; checklists: Card['checklists'] }>
  ) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, checklists } = detail;
    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, checklists } : c
        ),
      }))
    );
  }

  return {
    handleDragStart,
    handleCardCreate,
    handleCardMove,
    handleCardTitleUpdate,
    handleCardDescriptionUpdate,
    handleCardDueDateUpdate,
    handleCardStartDateUpdate,
    handleCardBackgroundUpdate,
    handleCardCompletedUpdate,
    handleCardDelete,
    handleCardArchive,
    handleCardChecklistsUpdate,
  };
}
