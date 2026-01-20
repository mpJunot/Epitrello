"use client";

import React, { useState, useEffect, useRef } from "react";
import CardItem from "../CardItem";
import { Card, ListColumnProps, SortOption } from "./types";
import { dispatchCustomEvent, generateId, createCardsSignature } from "./utils";
import { useMenuClose, useFocusWhen } from "./hooks";
import { CardComposer } from "./components/CardComposer";
import { ActionsMenu } from "./components/ActionsMenu";
import { CopyListMenu } from "./components/CopyListMenu";
import { MoveListMenu } from "./components/MoveListMenu";
import { MoveAllCardsMenu } from "./components/MoveAllCardsMenu";
import { SortMenu } from "./components/SortMenu";
import { DeleteListMenu } from "./components/DeleteListMenu";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ListColumn({
  list,
  totalListsCount = 1,
  allLists = []
}: ListColumnProps) {
  // Core state
  const [cards, setCards] = useState<Card[]>(list.cards || []);
  const [lastLocalChange, setLastLocalChange] = useState<number>(0);

  // Title editing state
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title || "Untitled");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Drag & drop state
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Card composer state
  const [addingCard, setAddingCard] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);

  // Column actions menu state
  const [showActions, setShowActions] = useState(false);
  const [isHoveringColumn, setIsHoveringColumn] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const actionsButtonRef = useRef<HTMLButtonElement | null>(null);

  // Submenu states
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showMoveAllCardsMenu, setShowMoveAllCardsMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeSortOption, setActiveSortOption] = useState<string | null>(null);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  // Sync local cards with parent prop updates
  useEffect(() => {
    const incoming = list.cards || [];
    const localSignature = createCardsSignature(cards);
    const incomingSignature = createCardsSignature(incoming);

    if (localSignature === incomingSignature) return;
    if (Date.now() - lastLocalChange < 400) return;

    console.log('🔄 ListColumn: Updating cards from parent for list:', list.id, list.title);
    setCards(incoming);
  }, [list.cards, cards, lastLocalChange, list.id, list.title]);

  // Sync title with parent updates
  useEffect(() => {
    setTitle(list.title || "Untitled");
  }, [list.title]);

  // Focus management
  useFocusWhen(editing, inputRef as React.RefObject<HTMLElement>, true);

  // Menu close handlers
  useMenuClose(showActions, () => setShowActions(false), actionsMenuRef as React.RefObject<HTMLElement>, actionsButtonRef as React.RefObject<HTMLElement>);
  useMenuClose(showCopyMenu, () => setShowCopyMenu(false), actionsMenuRef as React.RefObject<HTMLElement>);
  useMenuClose(showMoveMenu, () => setShowMoveMenu(false), actionsMenuRef as React.RefObject<HTMLElement>);
  useMenuClose(showMoveAllCardsMenu, () => setShowMoveAllCardsMenu(false), actionsMenuRef as React.RefObject<HTMLElement>);
  useMenuClose(showSortMenu, () => setShowSortMenu(false), actionsMenuRef as React.RefObject<HTMLElement>);
  useMenuClose(showDeleteMenu, () => setShowDeleteMenu(false), actionsMenuRef as React.RefObject<HTMLElement>);

  // Card operations
  const handleSubmitCard = (trimmedTitle: string) => {
    const newCard: Card = {
      id: generateId(),
      title: trimmedTitle,
      description: ""
    };

    setCards([...cards, newCard]);
    setLastLocalChange(Date.now());
    dispatchCustomEvent("epitrello:card-created", { listId: list.id, title: trimmedTitle });
  };

  const handleCancelAdd = () => {
    setAddingCard(false);
    setTimeout(() => addButtonRef.current?.focus(), 0);
  };

  // List operations
  const saveTitle = () => {
    const trimmedTitle = (title || "").trim();
    if (!trimmedTitle) {
      setTitle(list.title || "Untitled");
      setEditing(false);
      return;
    }

    setTitle(trimmedTitle);
    setEditing(false);

    if (trimmedTitle !== (list.title || "")) {
      dispatchCustomEvent("epitrello:list-updated", { listId: list.id, title: trimmedTitle });
    }
  };

  // Menu action handlers
  const handleCopyList = (newListName: string) => {
    const copiedCards = cards.map(card => ({
      ...card,
      id: generateId(),
    }));

    dispatchCustomEvent('epitrello:list-copied', {
      sourceListId: list.id,
      newListTitle: newListName,
      cards: copiedCards,
      boardId: 'current',
    });

    setShowCopyMenu(false);
  };

  const handleMoveList = (position: number) => {
    dispatchCustomEvent('epitrello:list-moved', {
      listId: list.id,
      newPosition: position,
      boardId: 'current',
    });

    setShowMoveMenu(false);
  };

  const handleMoveAllCards = (targetListId: string) => {
    if (!targetListId) return;

    dispatchCustomEvent('epitrello:move-all-cards', {
      sourceListId: list.id,
      targetListId: targetListId,
      cards: [...cards],
    });

    setCards([]);
    setShowMoveAllCardsMenu(false);
  };

  const handleDeleteList = () => {
    dispatchCustomEvent('epitrello:list-deleted', { listId: list.id });
    setShowDeleteMenu(false);
  };

  const handleSort = (sortOption: SortOption) => {
    setActiveSortOption(sortOption);

    const sortedCards = [...cards];

    switch (sortOption) {
      case 'date-newest':
        sortedCards.reverse();
        break;
      case 'date-oldest':
        // Natural order
        break;
      case 'due-date':
        // TODO: Implement when cards have dueDate field
        sortedCards.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'alpha-asc':
        sortedCards.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'alpha-desc':
        sortedCards.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    setCards(sortedCards);
    setLastLocalChange(Date.now());
    setShowSortMenu(false);
  };

  // Drag & drop handlers
  const handleCardDragStart = (e: React.DragEvent, cardId: string, fromIndex?: number) => {
    console.log('🎬 Drag start:', {
      cardId,
      isTemp: cardId?.startsWith('temp-'),
      fromIndex,
      listId: list.id
    });

    // CRITICAL: Extra safety check - should not reach here due to draggable=false, but just in case
    if (cardId?.startsWith('temp-')) {
      console.warn('⚠️ Attempted to drag temporary card:', cardId);
      e.preventDefault();
      return;
    }

    try {
      const fromIndexCalculated = typeof fromIndex === 'number' ? fromIndex : cards.findIndex((c) => c.id === cardId);

      const dragData = {
        cardId,
        fromListId: list.id,
        fromIndex: fromIndexCalculated
      };
      e.dataTransfer.setData('application/json', JSON.stringify(dragData));
      e.dataTransfer.effectAllowed = 'move';

      console.log('📦 Drag data set:', dragData);

      // Dispatch snapshot event - store full board state before drag
      dispatchCustomEvent('epitrello:drag-start', {
        cardId,
        fromListId: list.id,
        fromIndex: fromIndexCalculated
      });

      // Set drag image for better UX
      const draggedCard = cards.find(c => c.id === cardId);
      if (draggedCard && e.currentTarget instanceof HTMLElement) {
        const clone = e.currentTarget.cloneNode(true) as HTMLElement;
        clone.style.opacity = '0.8';
        clone.style.transform = 'rotate(5deg)';
        document.body.appendChild(clone);
        e.dataTransfer.setDragImage(clone, 0, 0);
        setTimeout(() => document.body.removeChild(clone), 0);
      }
    } catch (error) {
      console.error('Error setting drag data:', error);
    }
  };

  const handleCardDragOver = (e: React.DragEvent, overIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);

    // Calculate precise drop index based on mouse position
    if (typeof overIndex === 'number') {
      const cardElements = e.currentTarget.parentElement?.querySelectorAll('[draggable="true"]');
      if (cardElements && cardElements[overIndex]) {
        const rect = cardElements[overIndex].getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const adjustedIndex = e.clientY > midpoint ? overIndex + 1 : overIndex;
        setDragOverIndex(adjustedIndex);
      } else {
        setDragOverIndex(overIndex);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const raw = e.dataTransfer.getData('application/json');
    if (!raw) {
      setDragOverIndex(null);
      return;
    }

    try {
      const data = JSON.parse(raw);
      console.log('📥 Drop data received:', {
        cardId: data?.cardId,
        fromListId: data?.fromListId,
        toListId: list.id,
        isTemp: data?.cardId?.startsWith('temp-')
      });

      if (!data?.cardId) {
        setDragOverIndex(null);
        return;
      }

      // Calculate target index (defaults to end of list if not hovering over card)
      let targetIndex = dragOverIndex !== null ? dragOverIndex : cards.length;
      const fromIndex = data.fromIndex;
      const isIntralistMove = data.fromListId === list.id;

      // Early exit if no actual movement
      if (isIntralistMove && (fromIndex === -1 || targetIndex === fromIndex)) {
        setDragOverIndex(null);
        return;
      }

      // Adjust target index if moving down in same list
      if (isIntralistMove && fromIndex < targetIndex) {
        targetIndex = Math.max(0, targetIndex - 1);
      }

      // Dispatch single event for ALL drops - parent handler manages state
      // No local state mutation here - optimistic update happens in eventHandler
      dispatchCustomEvent('epitrello:card-move', {
        cardId: data.cardId,
        sourceListId: data.fromListId,
        targetListId: list.id,
        targetIndex: targetIndex,
        fromIndex: fromIndex,
      });
    } catch (error) {
      console.error('Error handling drop:', error);
    } finally {
      setDragOverIndex(null);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;

    // Only clear if truly leaving the column bounds
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setIsDragOver(false);
      setDragOverIndex(null);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
        // If no specific card index, default to end of list
        if (dragOverIndex === null && cards.length > 0) {
          setDragOverIndex(cards.length);
        } else if (cards.length === 0) {
          setDragOverIndex(0);
        }
      }}
      onDrop={handleDrop}
      onDragEnter={(e) => {
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDragLeave={handleDragLeave}
      onMouseEnter={() => setIsHoveringColumn(true)}
      onMouseLeave={() => setIsHoveringColumn(false)}
      className={`w-[272px] min-w-[272px] shrink-0 rounded-md shadow-sm flex flex-col animate-slide-in transition-all duration-200 ${
        isDragOver ? 'bg-trello-blue-light ring-2 ring-trello-blue shadow-lg' : 'bg-trello-card-bg'
      }`}
      style={{ height: '100%', maxHeight: '100%' }}
    >
      {/* Header */}
      <div className="p-4 pb-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {!editing ? (
            <h3
              className="font-medium text-trello text-sm cursor-text flex-1"
              onClick={() => setEditing(true)}
              title="Click to edit"
            >
              {title}
            </h3>
          ) : (
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                } else if (e.key === "Escape") {
                  setEditing(false);
                  setTitle(list.title || "Untitled");
                }
              }}
              className="flex-1 h-auto p-2 text-sm"
            />
          )}

          <div className="relative">
            <Button
              ref={actionsButtonRef}
              onClick={() => setShowActions(!showActions)}
              variant="ghost"
              size="icon"
              className={`transition-all duration-200 ${
                isHoveringColumn ? 'opacity-100' : 'opacity-30'
              }`}
              title="Column actions"
              aria-label="Column actions menu"
              aria-expanded={showActions}
              aria-haspopup="true"
            >
              <MoreVertical className="w-4 h-4 text-trello-text-secondary" aria-hidden="true" />
            </Button>

            {/* Menus */}
            <div ref={actionsMenuRef}>
              {showActions && !showCopyMenu && !showMoveMenu && !showMoveAllCardsMenu && !showSortMenu && !showDeleteMenu && (
                <ActionsMenu
                  onClose={() => setShowActions(false)}
                  onAddCard={() => setAddingCard(true)}
                  onCopyList={() => { setShowActions(false); setShowCopyMenu(true); }}
                  onMoveList={() => { if (totalListsCount > 1) { setShowActions(false); setShowMoveMenu(true); } }}
                  onMoveAllCards={() => { if (totalListsCount > 1) { setShowActions(false); setShowMoveAllCardsMenu(true); } }}
                  onSort={() => { if (cards.length > 0) { setShowActions(false); setShowSortMenu(true); } }}
                  onDelete={() => { setShowActions(false); setShowDeleteMenu(true); }}
                  totalListsCount={totalListsCount}
                  cardsCount={cards.length}
                  activeSortOption={activeSortOption}
                />
              )}

              {showCopyMenu && (
                <CopyListMenu
                  defaultName={`${title} (copy)`}
                  onClose={() => setShowCopyMenu(false)}
                  onSubmit={handleCopyList}
                />
              )}

              {showMoveMenu && (
                <MoveListMenu
                  totalListsCount={totalListsCount}
                  onClose={() => setShowMoveMenu(false)}
                  onSubmit={handleMoveList}
                />
              )}

              {showMoveAllCardsMenu && (
                <MoveAllCardsMenu
                  sourceListId={list.id}
                  allLists={allLists}
                  cardsCount={cards.length}
                  totalListsCount={totalListsCount}
                  onClose={() => setShowMoveAllCardsMenu(false)}
                  onSubmit={handleMoveAllCards}
                />
              )}

              {showSortMenu && (
                <SortMenu
                  cardsCount={cards.length}
                  activeSortOption={activeSortOption}
                  onClose={() => setShowSortMenu(false)}
                  onSort={handleSort}
                />
              )}

              {showDeleteMenu && (
                <DeleteListMenu
                  listTitle={title}
                  cardsCount={cards.length}
                  onClose={() => setShowDeleteMenu(false)}
                  onConfirm={handleDeleteList}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cards area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-3 custom-scrollbar" style={{ minHeight: 0 }}>
        {cards.length === 0 && dragOverIndex === 0 && (
          <div className="h-20 border-2 border-dashed border-indigo-300 bg-trello-blue-light rounded-md flex items-center justify-center animate-drag-placeholder">
            <span className="text-indigo-400 text-sm font-medium">Drop card here</span>
          </div>
        )}
        {cards.map((c, i) => (
          <div key={`${c.id}-${i}`} className="relative animate-fade-in">
            {dragOverIndex === i && (
              <div className="mb-2 h-2 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full shadow-lg animate-drag-placeholder" />
            )}
            <CardItem
              card={c}
              listId={list.id}
              index={i}
              onDragStart={handleCardDragStart}
              onDragOver={handleCardDragOver}
            />
          </div>
        ))}
        {dragOverIndex === cards.length && cards.length > 0 && (
          <div className="h-2 bg-gradient-to-r from-[var(--trello-blue)] to-[var(--trello-blue-hover)] rounded-full shadow-lg animate-drag-placeholder" />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 pt-3 border-t border-trello-border shrink-0 bg-trello-card-bg">
        {!addingCard ? (
          <Button
            ref={addButtonRef}
            onClick={() => setAddingCard(true)}
            variant="ghost"
            className="w-full justify-start bg-trello-card-bg hover:bg-trello-hover"
          >
            + Add a card
          </Button>
        ) : (
          <CardComposer
            onSubmit={handleSubmitCard}
            onCancel={handleCancelAdd}
          />
        )}
      </div>
    </div>
  );
}
