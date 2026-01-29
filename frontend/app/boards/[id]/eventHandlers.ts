import { Dispatch, SetStateAction } from 'react';
import { createList, updateList, reorderLists, deleteList, archiveList } from '@/lib/actions/lists';
import { createCard, moveCard, updateCard, deleteCard, archiveCard } from '@/lib/actions/cards';
import { List, Card } from './types';
import { logAction, handleAsyncError } from './utils';

type DetailEvent<T> = CustomEvent<T> | undefined;

export function createListEventHandlers(
  boardId: string,
  setLists: Dispatch<SetStateAction<List[]>>
) {
  async function handleListCreate(e?: DetailEvent<{ title: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { title } = detail;

    try {
      const newList = await createList({ boardId, title });
      if (!newList) throw new Error('Failed to create list');
      logAction('✅', 'List created');
      setLists((prev) => [...prev, { ...newList, position: newList.position ?? prev.length, isArchived: newList.isArchived ?? false, cards: [] }]);

      window.dispatchEvent(new CustomEvent('epitrello:list-create-success'));
    } catch (err) {
      handleAsyncError(err, 'create list');

      window.dispatchEvent(new CustomEvent('epitrello:list-create-error'));
    }
  }

  async function handleListUpdate(e?: DetailEvent<{ listId: string; title: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { listId, title } = detail;

    setLists((prevLists) =>
      prevLists.map((l) => (l.id === listId ? { ...l, title } : l))
    );

    try {
      await updateList({ id: listId, title });
      logAction('✅', 'List updated');
    } catch (err) {
      handleAsyncError(err, 'update list');
    }
  }

  async function handleListMove(e?: DetailEvent<{ listId: string; newPosition: number }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { listId, newPosition } = detail;

    let updatedLists: List[] = [];
    let originalLists: List[] = [];

    // Optimistic UI update
    setLists((prevLists) => {
      originalLists = [...prevLists];
      const sourceIndex = prevLists.findIndex((l) => l.id === listId);

      if (sourceIndex === -1 || sourceIndex === newPosition) return prevLists;

      const updated = [...prevLists];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(newPosition, 0, moved);
      updatedLists = updated;
      return updated;
    });

    // Backend sync with rollback
    (async () => {
      try {
        const positions = updatedLists.map((l, idx) => ({ id: l.id, position: idx }));
        await reorderLists({ boardId, listPositions: positions });
        logAction('✅', 'Lists reordered');
      } catch (err) {
        handleAsyncError(err, 'reorder lists');
        // Rollback on failure
        setLists(() => originalLists);
      }
    })();
  }

  async function handleListCopy(e?: DetailEvent<{ sourceListId: string; newListTitle: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { sourceListId, newListTitle } = detail;

    const tempListId = `temp-list-${Date.now()}`;
    let cardsToCreate: Card[] = [];

    setLists((prevLists) => {
      const sourceList = prevLists.find((l) => l.id === sourceListId);
      if (!sourceList) return prevLists;

      cardsToCreate = sourceList.cards || [];
      const newList: List = {
        id: tempListId,
        title: newListTitle,
        position: prevLists.length,
        isArchived: false,
        cards: cardsToCreate.map((c, idx) => ({
          ...c,
          id: `temp-card-${Date.now()}-${idx}`,
          position: c.position ?? idx,
          completed: c.completed ?? false,
        })),
      };
      return [...prevLists, newList];
    });

    // If no cards to create, exit early
    if (!cardsToCreate) return;

    (async () => {
      try {
        // 1. Create the new list
        const newList = await createList({ boardId, title: newListTitle });
        if (!newList) throw new Error('Failed to copy list');

        // 2. Create all cards in the new list
        const createdCards: Card[] = [];
        for (let i = 0; i < cardsToCreate.length; i++) {
          const sourceCard = cardsToCreate[i];
          const newCard = await createCard({
            listId: newList.id,
            title: sourceCard.title,
            description: sourceCard.description ?? undefined,
            position: i,
          });
          createdCards.push({
            id: newCard.id,
            title: newCard.title,
            description: newCard.description ?? undefined,
            position: newCard.position ?? i,
            listId: newCard.listId ?? newList.id,
            dueDate: newCard.dueDate ?? undefined,
            startDate: newCard.startDate ?? undefined,
            completed: newCard.completed ?? sourceCard.completed ?? false,
            background: (newCard as { background?: string }).background ?? sourceCard.background,
            createdAt: (newCard as { createdAt?: string }).createdAt ?? new Date().toISOString(),
            labels: sourceCard.labels,
            assignees: sourceCard.assignees,
            checklists: sourceCard.checklists,
          });
        }

        setLists((prev) =>
          prev.map((l) =>
            l.id === tempListId ? { ...newList, position: newList.position ?? prev.length, isArchived: newList.isArchived ?? false, cards: createdCards } : l
          )
        );

        logAction('✅', `List copied with ${createdCards.length} card(s)`);
      } catch (err) {
        handleAsyncError(err, 'copy list');
        setLists((prev) => prev.filter((l) => l.id !== tempListId));
      }
    })();
  }

  async function handleMoveAllCards(e?: DetailEvent<{ sourceListId: string; targetListId: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { sourceListId, targetListId } = detail;

    let cardsToMove: Card[] = [];
    setLists((prevLists) => {
      const source = prevLists.find((l) => l.id === sourceListId);
      cardsToMove = source?.cards || [];
      return prevLists.map((l) => {
        if (l.id === sourceListId) return { ...l, cards: [] };
        if (l.id === targetListId)
          return { ...l, cards: [...(l.cards || []), ...cardsToMove] };
        return l;
      });
    });

    (async () => {
      if (cardsToMove.length === 0) return;
      try {
        for (const card of cardsToMove) {
          await moveCard({ cardId: card.id, targetListId });
        }
        logAction('✅', 'All cards moved');
      } catch (err) {
        handleAsyncError(err, 'move all cards');
      }
    })();
  }

  async function handleListDelete(e?: DetailEvent<{ listId: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { listId } = detail;

    setLists((prevLists) => prevLists.filter((l) => l.id !== listId));

    try {
      await deleteList(listId);
      logAction('✅', 'List deleted');
    } catch (err) {
      handleAsyncError(err, 'delete list');
      window.location.reload();
    }
  }

  async function handleListArchive(e?: DetailEvent<{ listId: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { listId } = detail;

    try {
      await archiveList(listId);
      logAction('✅', 'List archived');
      setLists((prevLists) => prevLists.filter((l) => l.id !== listId));
    } catch (err) {
      handleAsyncError(err, 'archive list');
    }
  }

  return {
    handleListCreate,
    handleListUpdate,
    handleListMove,
    handleListCopy,
    handleMoveAllCards,
    handleListDelete,
    handleListArchive,
  };
}

export function createCardEventHandlers(
  setLists: Dispatch<SetStateAction<List[]>>
) {
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

    console.log('🎯 handleCardMove called with:', {
      cardId,
      sourceListId,
      targetListId,
      targetIndex,
      fromIndex,
      isTemp: cardId?.startsWith('temp-')
    });

    // CRITICAL: Reject temporary cards to prevent "Card not found" errors
    if (cardId?.startsWith('temp-')) {
      console.warn('⚠️ Cannot move temporary card:', cardId, '- card still being created');
      return;
    }

    // Optimistic UI update - single source of truth
    setLists((prevLists) => {
      const sourceList = prevLists.find((l) => l.id === sourceListId);
      const targetList = prevLists.find((l) => l.id === targetListId);
      const movedCard = sourceList?.cards?.find((c) => c.id === cardId);

      console.log('🔍 Card lookup:', {
        cardId,
        foundInSource: !!movedCard,
        sourceListCards: sourceList?.cards?.map(c => ({ id: c.id, title: c.title })),
        targetListCards: targetList?.cards?.map(c => ({ id: c.id, title: c.title }))
      });

      if (!movedCard) {
        console.error('❌ Card not found in source list:', {
          cardId,
          sourceListId,
          sourceListExists: !!sourceList,
          cardsInSource: sourceList?.cards?.length || 0
        });
        return prevLists;
      }

      const isSameList = sourceListId === targetListId;

      if (isSameList) {
        // Same list: reorder cards array
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
        // Different lists: remove from source, insert into target
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

    // Single backend call with final positions
    console.log('📤 Calling backend moveCard with:', {
      cardId,
      targetListId,
      position: targetIndex,
      isTemp: cardId?.startsWith('temp-')
    });

    try {
      await moveCard({ cardId, targetListId, position: targetIndex });
      logAction('✅', 'Card moved');
    } catch (err) {
      console.error('❌ Backend moveCard failed:', err);
      handleAsyncError(err, 'move card');

      // Restore exact pre-drag snapshot
      if (boardSnapshot.length > 0) {
        console.log('🔄 Restoring snapshot after failed move');
        setLists(() => JSON.parse(JSON.stringify(boardSnapshot)));
      } else {
        console.warn('⚠️ No snapshot available for rollback');
      }
    }
  }

  async function handleCardTitleUpdate(e?: DetailEvent<{ cardId: string; title: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, title } = detail;

    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, title } : c
        ),
      }))
    );

    try {
      await updateCard({ id: cardId, title });
      logAction('✅', 'Card title updated');
    } catch (err) {
      handleAsyncError(err, 'update card title');
    }
  }

  async function handleCardDescriptionUpdate(e?: DetailEvent<{ cardId: string; description: string }>) {
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

    try {
      await updateCard({ id: cardId, description });
      logAction('✅', 'Card description updated');
    } catch (err) {
      handleAsyncError(err, 'update card description');
    }
  }

  async function handleCardDueDateUpdate(e?: DetailEvent<{ cardId: string; dueDate?: { date?: string; isComplete?: boolean } }>) {
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

    try {
      await updateCard({ id: cardId, dueDate: dueDateValue });
      logAction('✅', 'Card due date updated');
    } catch (err) {
      handleAsyncError(err, 'update card due date');
    }
  }

  async function handleCardStartDateUpdate(e?: DetailEvent<{ cardId: string; startDate?: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, startDate } = detail;

    // If startDate is undefined, we want to remove it (pass null to backend)
    const startDateValue = startDate === undefined ? null : startDate;

    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, startDate: startDateValue ?? undefined } : c
        ),
      }))
    );

    try {
      // Pass null explicitly to remove the date, or the date value if set
      await updateCard({ id: cardId, startDate: startDateValue });
      logAction('✅', 'Card start date updated');
    } catch (err) {
      handleAsyncError(err, 'update card start date');
    }
  }

  async function handleCardCompletedUpdate(e?: DetailEvent<{ cardId: string; completed: boolean }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, completed } = detail;

    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, completed } : c
        ),
      }))
    );

    try {
      await updateCard({ id: cardId, completed });
      logAction('✅', 'Card completed status updated');
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
    } catch (err) {
      handleAsyncError(err, 'archive card');
    }
  }

  async function handleCardBackgroundUpdate(e?: DetailEvent<{ cardId: string; background?: string | null; skipBackendUpdate?: boolean }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, background, skipBackendUpdate } = detail;

    // If background is undefined, we want to remove it (pass null to backend)
    const backgroundValue = background === undefined ? null : (background || null);

    // Update local state optimistically
    setLists((prevLists) =>
      prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) =>
          c.id === cardId ? { ...c, background: backgroundValue ?? undefined } : c
        ),
      }))
    );

    // Update backend only if not already done (skipBackendUpdate flag)
    if (!skipBackendUpdate) {
      try {
        await updateCard({ id: cardId, background: backgroundValue });
        logAction('✅', 'Card background updated');
      } catch (err) {
        handleAsyncError(err, 'update card background');
      }
    } else {
      logAction('✅', 'Card background updated in local state (backend update skipped)');
    }
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
