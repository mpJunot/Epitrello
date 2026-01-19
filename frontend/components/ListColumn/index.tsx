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

export default function ListColumn({ 
  list, 
  totalListsCount = 1,
  allLists = []
}: ListColumnProps) {
  // Core state
  const [cards, setCards] = useState<Card[]>(list.cards || []);
  const [lastLocalChange, setLastLocalChange] = useState<number>(0);
  const [ignoreParentSync, setIgnoreParentSync] = useState(false);
  
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
    if (ignoreParentSync) return;

    const incoming = list.cards || [];
    const localSignature = createCardsSignature(cards);
    const incomingSignature = createCardsSignature(incoming);

    if (localSignature === incomingSignature) return;
    if (Date.now() - lastLocalChange < 400) return;

    console.log('🔄 ListColumn: Updating cards from parent for list:', list.id, list.title);
    setCards(incoming);
  }, [list.cards, ignoreParentSync, cards, lastLocalChange, list.id, list.title]);

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
    dispatchCustomEvent("epitrello:card-created", { listId: list.id, card: newCard });
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
    setIgnoreParentSync(true);
    
    try {
      e.dataTransfer.setData('application/json', JSON.stringify({ 
        cardId, 
        fromListId: list.id, 
        fromIndex 
      }));
      e.dataTransfer.effectAllowed = 'move';
    } catch (error) {
      console.error('Error setting drag data:', error);
    }
    
    const el = e.currentTarget as HTMLElement;
    el.classList.add('opacity-70', 'scale-105');
  };

  const handleCardDragOver = (e: React.DragEvent, overIndex?: number) => {
    e.preventDefault();
    setIsDragOver(true);
    setDragOverIndex(typeof overIndex === 'number' ? overIndex : null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) {
      setDragOverIndex(null);
      return;
    }

    try {
      const data = JSON.parse(raw);
      if (!data?.cardId) {
        setDragOverIndex(null);
        return;
      }

      const provisionalIndex = dragOverIndex !== null ? dragOverIndex : cards.length;
      const isIntralistMove = data.fromListId === list.id;

      if (isIntralistMove) {
        const fromIndex = typeof data.fromIndex === 'number' 
          ? data.fromIndex 
          : cards.findIndex((c) => c.id === data.cardId);
          
        if (fromIndex === -1) {
          setIgnoreParentSync(false);
          setDragOverIndex(null);
          return;
        }

        let toIndex = provisionalIndex;
        if (toIndex === fromIndex) {
          setIgnoreParentSync(false);
          setDragOverIndex(null);
          return;
        }

        if (fromIndex < toIndex) {
          toIndex = Math.max(0, toIndex - 1);
        }

        const newCards = [...cards];
        const [card] = newCards.splice(fromIndex, 1);
        newCards.splice(toIndex, 0, card);
        
        setCards(newCards);
        setLastLocalChange(Date.now());
        
        dispatchCustomEvent('epitrello:card-move', {
          cardId: data.cardId,
          fromListId: list.id,
          toListId: list.id,
          toIndex,
        });
        
        setIgnoreParentSync(false);
      } else {
        dispatchCustomEvent('epitrello:card-move', {
          cardId: data.cardId,
          fromListId: data.fromListId,
          toListId: list.id,
          toIndex: provisionalIndex,
        });
        
        setIgnoreParentSync(false);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    } finally {
      setDragOverIndex(null);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setIsDragOver(false);
      setDragOverIndex(null);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={handleDragLeave}
      onMouseEnter={() => setIsHoveringColumn(true)}
      onMouseLeave={() => setIsHoveringColumn(false)}
      className={`w-[272px] min-w-[272px] flex-shrink-0 ${isDragOver ? 'bg-white ring-2 ring-indigo-200' : 'bg-gray-100'} rounded-md shadow-sm flex flex-col animate-slide-in`}
      style={{ height: '100%', maxHeight: '100%' }}
    >
      {/* Header */}
      <div className="p-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          {!editing ? (
            <h3
              className="font-medium text-gray-800 text-sm cursor-text flex-1"
              onClick={() => setEditing(true)}
              title="Click to edit"
            >
              {title}
            </h3>
          ) : (
            <input
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
              className="flex-1 bg-white text-gray-900 text-sm rounded px-2 py-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
            />
          )}
          
          <div className="relative">
            <button
              ref={actionsButtonRef}
              onClick={() => setShowActions(!showActions)}
              className={`p-1.5 rounded transition-all duration-200 hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                isHoveringColumn ? 'opacity-100' : 'opacity-30'
              }`}
              title="Column actions"
              aria-label="Column actions menu"
              aria-expanded={showActions}
              aria-haspopup="true"
            >
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="2" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="14" cy="8" r="1.5" />
              </svg>
            </button>

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
        {cards.map((c, i) => (
          <div key={`${c.id}-${i}`} className="relative animate-fade-in">
            {dragOverIndex === i && (
              <div className="absolute -top-2 left-0 right-0 h-1 bg-indigo-200 rounded" />
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
        {dragOverIndex === cards.length && <div className="h-1 bg-indigo-200 rounded" />}
      </div>

      {/* Footer */}
      <div className="p-4 pt-3 border-t border-gray-200 flex-shrink-0 bg-gray-100">
        {!addingCard ? (
          <button
            ref={addButtonRef}
            onClick={() => setAddingCard(true)}
            className="w-full text-left text-sm text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 rounded px-3 py-2 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            + Add a card
          </button>
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
