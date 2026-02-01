import type { QueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction } from 'react';
import { createCard, moveCard, updateCard, deleteCard, archiveCard } from '@/lib/actions/cards';
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
  // Store full board snapshot before drag for exact rollback
  let boardSnapshot: List[] = [];

  function handleDragStart(e?: DetailEvent<{ cardId: string }>) {
    const detail = e?.detail;
    if (!detail) return;

    const { cardId } = detail;

    // CRITICAL: Reject temporary cards before capturing snapshot
    if (cardId?.startsWith('temp-')) {
      console.warn('⚠️ Cannot drag temporary card:', cardId, '- card still being created');
      return; // Don't capture snapshot
    }

    // Capture full board state before any mutations
    setLists((prevLists) => {
      boardSnapshot = JSON.parse(JSON.stringify(prevLists)); // Deep clone
      return prevLists; // No mutation
    });

    console.log('📸 Snapshot captured:', boardSnapshot.length, 'lists');
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
        l.id === listId
          ? { ...l, cards: [...(l.cards || []), tempCard] }
          : l
      )
    );

    try {
      const newCard = await createCard({ listId, title });
      if (!newCard) throw new Error('Failed to create card');
      logAction('✅', 'Card created');
      setLists((prevLists) =>
        prevLists.map((l) =>
          l.id === listId
            ? {
              ...l,
              cards: (l.cards || []).map((c) =>
                c.id === tempCard.id ? {
                  id: newCard.id,
                  title: newCard.title,
                  description: newCard.description ?? undefined,
                  position: newCard.position ?? 0,
                  listId: newCard.listId ?? listId,
                  dueDate: newCard.dueDate ?? undefined,
                  startDate: newCard.startDate ?? undefined,
                  completed: newCard.completed ?? false,
                  background: (newCard as { background?: string }).background,
                  createdAt: (newCard as { createdAt?: string }).createdAt ?? new Date().toISOString(),
                  labels: undefined,
                  assignees: undefined,
                  checklists: undefined,
                } : c
              ),
            }
            : l
        )
      );
      invalidateBoard();
      invalidateActivity();
    } catch (err) {
      handleAsyncError(err, 'create card');
      setLists((prevLists) =>
        prevLists.map((l) =>
          l.id === listId
            ? { ...l, cards: (l.cards || []).filter((c) => c.id !== tempCard.id) }
            : l
        )
      );
    }
  }

  async function handleCardMove(
    e?: DetailEvent<{ cardId: string; sourceListId: string; targetListId: string; targetIndex: number; fromIndex: number }>
  ) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, sourceListId, targetListId, targetIndex, fromIndex } = detail;

    // CRITICAL: Reject temporary cards to prevent "Card not found" errors
    if (cardId?.startsWith('temp-')) {
      console.warn('⚠️ Cannot move temporary card:', cardId, '- card still being created');
      return;
    }

    // Optimistic UI update - single source of truth
    setLists((prevLists) => {
      const sourceList = prevLists.find((l) => l.id === sourceListId);
      const movedCard = sourceList?.cards?.find((c) => c.id === cardId);

      if (!movedCard) return prevLists;

      const isSameList = sourceListId === targetListId;

      if (isSameList) {
        return prevLists.map((l) => {
          if (l.id === sourceListId) {
            const newCards = [...(l.cards || [])];
            const [removed] = newCards.splice(fromIndex, 1);
            newCards.splice(targetIndex, 0, removed);
            return { ...l, cards: newCards };
          }
          return l;
        });
      } else {
        return prevLists.map((l) => {
          if (l.id === sourceListId) {
            return { ...l, cards: (l.cards || []).filter((c) => c.id !== cardId) };
          }
          if (l.id === targetListId) {
            const newCards = [...(l.cards || [])];
            newCards.splice(targetIndex, 0, movedCard);
            return { ...l, cards: newCards };
          }
          return l;
        });
      }
    });

    try {
      await moveCard({ cardId, targetListId, position: targetIndex });
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
    // Sync cache only (modal already called updateCard + setQueryData; emit is for other listeners)
    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, title } : c
        ),
      }))
    );
  }

  function handleCardDescriptionUpdate(e?: DetailEvent<{ cardId: string; description: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, description } = detail;
    // Sync cache only (modal already called updateCard + setQueryData; emit is for other listeners)
    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, description } : c
        ),
      }))
    );
  }

  function handleCardDueDateUpdate(e?: DetailEvent<{ cardId: string; dueDate?: { date?: string; isComplete?: boolean } }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, dueDate } = detail;

    const dueDateValue = dueDate === undefined ? null : (dueDate?.date ?? null);

    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, dueDate: dueDateValue ?? undefined } : c
        ),
      }))
    );
  }

  function handleCardStartDateUpdate(e?: DetailEvent<{ cardId: string; startDate?: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, startDate } = detail;

    const startDateValue = startDate === undefined ? null : startDate;

    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, startDate: startDateValue ?? undefined } : c
        ),
      }))
    );
  }

  async function handleCardCompletedUpdate(e?: DetailEvent<{ cardId: string; completed: boolean }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, completed } = detail;

    const prevLists = getLists?.() ?? [];
    const doneList = prevLists.find(
      (l) => l.title?.toLowerCase().trim() === 'done',
    );
    const sourceList = prevLists.find((l) =>
      l.cards?.some((c) => c.id === cardId),
    );
    const card = sourceList?.cards?.find((c) => c.id === cardId);
    const shouldMoveToDone =
      completed &&
      !!doneList &&
      !!sourceList &&
      !!card &&
      sourceList.id !== doneList.id;

    setLists((prevLists) => {
      if (shouldMoveToDone && doneList && sourceList && card) {
        return prevLists.map((lst) => {
          if (lst.id === sourceList.id) {
            return {
              ...lst,
              cards: (lst.cards || []).filter((c) => c.id !== cardId),
            };
          }
          if (lst.id === doneList.id) {
            return {
              ...lst,
              cards: [...(lst.cards || []), { ...card, completed: true }],
            };
          }
          return lst;
        });
      }
      return prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, completed } : c,
        ),
      }));
    });

    try {
      await updateCard({ id: cardId, completed });
      if (shouldMoveToDone && doneList && card) {
        await moveCard({
          cardId,
          targetListId: doneList.id,
          position: doneList.cards?.length ?? 0,
        });
        logAction('✅', 'Card completed and moved to Done');
      } else {
        logAction('✅', 'Card completed status updated');
      }
      invalidateBoard();
      invalidateActivity();
    } catch (err) {
      handleAsyncError(err, 'update card completed status');
    }
  }

  async function handleCardDelete(e?: DetailEvent<{ cardId: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId } = detail;

    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).filter((c) => c.id !== cardId),
      }))
    );

    try {
      await deleteCard(cardId);
      logAction('✅', 'Card deleted');
      invalidateBoard();
    } catch (err) {
      handleAsyncError(err, 'delete card');
      window.location.reload();
    }
  }

  async function handleCardArchive(e?: DetailEvent<{ cardId: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId } = detail;

    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).filter((c) => c.id !== cardId),
      }))
    );

    try {
      await archiveCard(cardId);
      logAction('✅', 'Card archived');
      invalidateBoard();
    } catch (err) {
      handleAsyncError(err, 'archive card');
    }
  }

  function handleCardBackgroundUpdate(e?: DetailEvent<{ cardId: string; background?: string | null; skipBackendUpdate?: boolean }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, background } = detail;

    const backgroundValue = background === undefined ? null : (background || null);

    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, background: backgroundValue ?? undefined } : c
        ),
      }))
    );
  }

  async function handleCardChecklistsUpdate(
    e?: DetailEvent<{ cardId: string; checklists: unknown[] }>,
  ) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, checklists } = detail;

    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, checklists: checklists as typeof c.checklists } : c
        ),
      }))
    );

    logAction('✅', 'Card checklists updated');
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
