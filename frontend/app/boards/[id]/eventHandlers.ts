import { Dispatch, SetStateAction } from 'react';
import { createList, updateList, reorderLists, deleteList } from '@/lib/actions/lists';
import { createCard, moveCard, reorderCards, updateCard, deleteCard } from '@/lib/actions/cards';
import { List, Card } from './types';
import { logAction, handleAsyncError } from './utils';

export function createListEventHandlers(
  boardId: string,
  setLists: Dispatch<SetStateAction<List[]>>
) {
  async function handleListCreate(e: any) {
    const detail = e?.detail;
    if (!detail) return;
    const { title } = detail;

    try {
      const newList = await createList({ boardId, title });
      if (!newList) throw new Error('Failed to create list');
      logAction('✅', 'List created');
      setLists((prev) => [...prev, { ...newList, cards: [] }]);
    } catch (err) {
      handleAsyncError(err, 'create list');
    }
  }

  async function handleListUpdate(e: any) {
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

  async function handleListMove(e: any) {
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

  async function handleListCopy(e: any) {
    const detail = e?.detail;
    if (!detail) return;
    const { sourceListId, newListTitle } = detail;

    const tempListId = `temp-list-${Date.now()}`;
    let cardsToCreate: Card[] = [];

    // Create temporary list with temporary cards (optimistic update)
    setLists((prevLists) => {
      const sourceList = prevLists.find((l) => l.id === sourceListId);
      if (!sourceList) return prevLists;

      cardsToCreate = sourceList.cards || [];
      const newList: List = {
        id: tempListId,
        title: newListTitle,
        cards: cardsToCreate.map((c, idx) => ({
          ...c,
          id: `temp-card-${Date.now()}-${idx}`,
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
            description: sourceCard.description,
            position: i,
          });
          createdCards.push(newCard);
        }

        // 3. Replace temp list with real list and cards
        setLists((prev) =>
          prev.map((l) =>
            l.id === tempListId ? { ...newList, cards: createdCards } : l
          )
        );

        logAction('✅', `List copied with ${createdCards.length} card(s)`);
      } catch (err) {
        handleAsyncError(err, 'copy list');
        // Rollback: remove temporary list
        setLists((prev) => prev.filter((l) => l.id !== tempListId));
      }
    })();
  }

  async function handleMoveAllCards(e: any) {
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

  async function handleListDelete(e: any) {
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

  return {
    handleListCreate,
    handleListUpdate,
    handleListMove,
    handleListCopy,
    handleMoveAllCards,
    handleListDelete,
  };
}

export function createCardEventHandlers(
  setLists: Dispatch<SetStateAction<List[]>>
) {
  // Store full board snapshot before drag for exact rollback
  let boardSnapshot: List[] = [];

  function handleDragStart(e: any) {
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

  async function handleCardCreate(e: any) {
    const detail = e?.detail;
    if (!detail) return;
    const { listId, title } = detail;

    const tempCard: Card = {
      id: `temp-${Date.now()}`,
      title,
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
                  c.id === tempCard.id ? newCard : c
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

  async function handleCardMove(e: any) {
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

  async function handleCardTitleUpdate(e: any) {
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

  async function handleCardDescriptionUpdate(e: any) {
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

  async function handleCardDueDateUpdate(e: any) {
    const detail = e?.detail;
    if (!detail) return;
    const { cardId, dueDate } = detail;

    try {
      await updateCard({ id: cardId, dueDate: dueDate?.date });
      logAction('✅', 'Card due date updated');
    } catch (err) {
      handleAsyncError(err, 'update card due date');
    }
  }

  async function handleCardDelete(e: any) {
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

  return {
    handleDragStart,
    handleCardCreate,
    handleCardMove,
    handleCardTitleUpdate,
    handleCardDescriptionUpdate,
    handleCardDueDateUpdate,
    handleCardDelete,
  };
}
