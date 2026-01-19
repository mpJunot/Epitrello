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
    const { sourceIndex, targetIndex } = detail;

    let updatedLists: List[] = [];
    setLists((prevLists) => {
      const updated = [...prevLists];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);
      updatedLists = updated;
      return updated;
    });

    (async () => {
      try {
        const positions = updatedLists.map((l, idx) => ({ id: l.id, position: idx }));
        await reorderLists({ boardId, listPositions: positions });
        logAction('✅', 'Lists reordered');
      } catch (err) {
        handleAsyncError(err, 'reorder lists');
      }
    })();
  }

  async function handleListCopy(e: any) {
    const detail = e?.detail;
    if (!detail) return;
    const { listId, title } = detail;

    setLists((prevLists) => {
      const source = prevLists.find((l) => l.id === listId);
      if (!source) return prevLists;
      const newList: List = {
        id: `temp-${Date.now()}`,
        title,
        cards: (source.cards || []).map((c) => ({
          ...c,
          id: `temp-card-${Date.now()}-${Math.random()}`,
        })),
      };
      return [...prevLists, newList];
    });

    (async () => {
      try {
        const newList = await createList({ boardId, title });
        if (!newList) throw new Error('Failed to copy list');
        logAction('✅', 'List copied');
        setLists((prev) =>
          prev.map((l) =>
            l.id.startsWith('temp-') ? { ...newList, cards: l.cards } : l
          )
        );
      } catch (err) {
        handleAsyncError(err, 'copy list');
        setLists((prev) => prev.filter((l) => !l.id.startsWith('temp-')));
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
    const { cardId, sourceListId, targetListId, targetIndex } = detail;

    setLists((prevLists) => {
      const sourceList = prevLists.find((l) => l.id === sourceListId);
      const movedCard = sourceList?.cards?.find((c) => c.id === cardId);

      if (!movedCard) return prevLists;

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
    });

    (async () => {
      try {
        if (sourceListId !== targetListId) {
          await moveCard({ cardId, targetListId });
        }
        logAction('✅', 'Card moved');
      } catch (err) {
        handleAsyncError(err, 'move card');
      }
    })();
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
    handleCardCreate,
    handleCardMove,
    handleCardTitleUpdate,
    handleCardDescriptionUpdate,
    handleCardDueDateUpdate,
    handleCardDelete,
  };
}
