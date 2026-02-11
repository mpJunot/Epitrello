import type { QueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { createList, updateList, reorderLists, deleteList, archiveList } from '@/lib/actions/lists';
import { createCard, moveCard } from '@/lib/actions/cards';
import { List, Card } from './types';
import { boardQueryKey } from './queries';
import { activityInvalidateKey, activityBoardInvalidateKey } from '@/lib/queries/activity';
import { logAction, handleAsyncError } from './utils';

type DetailEvent<T> = CustomEvent<T> | undefined;

export function createListEventHandlers(
  boardId: string,
  setLists: Dispatch<SetStateAction<List[]>>,
  queryClient?: QueryClient,
) {
  const invalidateBoard = () => {
    queryClient?.invalidateQueries({ queryKey: boardQueryKey(boardId) });
  };
  const invalidateActivity = () => {
    queryClient?.invalidateQueries({ queryKey: activityInvalidateKey });
    queryClient?.invalidateQueries({ queryKey: activityBoardInvalidateKey });
  };
  async function handleListCreate(e?: DetailEvent<{ title: string }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { title } = detail;

    try {
      const newList = await createList({ boardId, title });
      if (!newList) throw new Error('Failed to create list');
      logAction('✅', 'List created');
      setLists((prev) => [...prev, { ...newList, position: newList.position ?? prev.length, isArchived: newList.isArchived ?? false, cards: [] }]);
      invalidateBoard();
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
      invalidateBoard();
    } catch (err) {
      handleAsyncError(err, 'update list');
    }
  }

  async function handleListMove(e?: DetailEvent<{ listId: string; newPosition: number }>) {
    const detail = e?.detail;
    if (!detail) return;
    const { listId, newPosition } = detail;

    let listPositions: { id: string; position: number }[] = [];
    let originalLists: List[] = [];

    setLists((prevLists) => {
      originalLists = [...prevLists];
      const sourceIndex = prevLists.findIndex((l) => l.id === listId);
      if (sourceIndex === -1 || sourceIndex === newPosition) return prevLists;

      const updated = arrayMove(prevLists, sourceIndex, newPosition);
      listPositions = updated.map((l, idx) => ({ id: l.id, position: idx }));
      return updated;
    });

    try {
      await reorderLists({ boardId, listPositions });
      logAction('✅', 'Lists reordered');
      invalidateBoard();
    } catch (err) {
      handleAsyncError(err, 'reorder lists');
      setLists(() => originalLists);
    }
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

    if (!cardsToCreate) return;

    (async () => {
      try {
        // 1. Create the new list
        const newList = await createList({ boardId, title: newListTitle });
        if (!newList) throw new Error('Failed to copy list');

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
        invalidateBoard();
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
        invalidateBoard();
        invalidateActivity();
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
      invalidateBoard();
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
      invalidateBoard();
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
