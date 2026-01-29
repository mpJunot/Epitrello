import { useEffect } from 'react';
import { createListEventHandlers, createCardEventHandlers } from './eventHandlers';
import { List } from './types';

export function useEventListeners(
  boardId: string,
  setLists: React.Dispatch<React.SetStateAction<List[]>>
) {
  useEffect(() => {
    const listHandlers = createListEventHandlers(boardId, setLists);
    const cardHandlers = createCardEventHandlers(setLists);

    const eventMap = {
      'epitrello:list-create': listHandlers.handleListCreate,
      'epitrello:list-updated': listHandlers.handleListUpdate,
      'epitrello:list-moved': listHandlers.handleListMove,
      'epitrello:list-copied': listHandlers.handleListCopy,
      'epitrello:move-all-cards': listHandlers.handleMoveAllCards,
      'epitrello:list-deleted': listHandlers.handleListDelete,
      'epitrello:drag-start': cardHandlers.handleDragStart,
      'epitrello:card-created': cardHandlers.handleCardCreate,
      'epitrello:card-move': cardHandlers.handleCardMove,
      'epitrello:card-title-updated': cardHandlers.handleCardTitleUpdate,
      'epitrello:card-description-updated': cardHandlers.handleCardDescriptionUpdate,
      'epitrello:card-duedate-updated': cardHandlers.handleCardDueDateUpdate,
      'epitrello:card-startdate-updated': cardHandlers.handleCardStartDateUpdate,
      'epitrello:card-background-updated': cardHandlers.handleCardBackgroundUpdate,
      'epitrello:card-completed-updated': cardHandlers.handleCardCompletedUpdate,
      'epitrello:card-deleted': cardHandlers.handleCardDelete,
      'epitrello:card-checklists-updated': cardHandlers.handleCardChecklistsUpdate,
    };

    // Register all event listeners
    Object.entries(eventMap).forEach(([event, handler]) => {
      window.addEventListener(event, handler as EventListener);
    });

    // Cleanup function
    return () => {
      Object.entries(eventMap).forEach(([event, handler]) => {
        window.removeEventListener(event, handler as EventListener);
      });
    };
  }, [boardId, setLists]);
}
