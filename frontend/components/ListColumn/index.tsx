'use client';

import React, { useState, useEffect, useRef } from 'react';
import CardItem from '../CardItem';
import { Card, ListColumnProps, SortOption } from './types';
import { dispatchCustomEvent, generateId, createCardsSignature } from './utils';
import { useFocusWhen } from './hooks';
import { CardComposer } from './components/CardComposer';
import { ListColumnDialogs } from './components/ListColumnDialogs';
import {
  MoreVertical,
  Plus,
  Copy,
  Move,
  ArrowRight,
  ArrowUpDown,
  Trash2,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
export default function ListColumn({
  list,
  totalListsCount = 1,
  allLists = [],
  dragHandleProps,
  boardId,
  readOnly = false,
}: ListColumnProps) {
  const [cards, setCards] = useState<Card[]>(list.cards || []);
  const [lastLocalChange, setLastLocalChange] = useState<number>(0);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title || 'Untitled');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [addingCard, setAddingCard] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);

  const [isHoveringColumn, setIsHoveringColumn] = useState(false);

  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showMoveAllCardsDialog, setShowMoveAllCardsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [activeSortOption, setActiveSortOption] = useState<string | null>(null);

  useEffect(() => {
    const incoming = list.cards || [];
    const localSignature = createCardsSignature(cards);
    const incomingSignature = createCardsSignature(incoming);

    if (localSignature === incomingSignature) return;
    // Sync immédiat si le parent a plus de cartes (création temps réel ou handler)
    const hasNewCardsFromParent =
      (incoming?.length ?? 0) > (cards?.length ?? 0);
    if (!hasNewCardsFromParent && Date.now() - lastLocalChange < 400) return;

    setCards(incoming);
  }, [list.cards, cards, lastLocalChange, list.id, list.title]);

  useEffect(() => {
    setTitle(list.title || 'Untitled');
  }, [list.title]);

  useFocusWhen(editing, inputRef as React.RefObject<HTMLElement>, true);

  const sortOptions = [
    { value: 'date-newest', label: 'Date created (newest first)' },
    { value: 'date-oldest', label: 'Date created (oldest first)' },
    { value: 'due-date', label: 'Due date' },
    { value: 'alpha-asc', label: 'Alphabetically (A → Z)' },
    { value: 'alpha-desc', label: 'Alphabetically (Z → A)' },
  ] as const;

  const handleSubmitCard = (trimmedTitle: string) => {
    dispatchCustomEvent('epitrello:card-created', {
      listId: list.id,
      title: trimmedTitle,
    });
  };

  const handleCancelAdd = () => {
    setAddingCard(false);
    setTimeout(() => addButtonRef.current?.focus(), 0);
  };

  // List operations
  const saveTitle = () => {
    const trimmedTitle = (title || '').trim();
    if (!trimmedTitle) {
      setTitle(list.title || 'Untitled');
      setEditing(false);
      return;
    }

    setTitle(trimmedTitle);
    setEditing(false);

    if (trimmedTitle !== (list.title || '')) {
      dispatchCustomEvent('epitrello:list-updated', {
        listId: list.id,
        title: trimmedTitle,
      });
    }
  };

  // Menu action handlers
  const handleCopyList = (newListName: string) => {
    const copiedCards = cards.map((card) => ({
      ...card,
      id: generateId(),
    }));

    dispatchCustomEvent('epitrello:list-copied', {
      sourceListId: list.id,
      newListTitle: newListName,
      cards: copiedCards,
      boardId: 'current',
    });

    setShowCopyDialog(false);
  };

  const handleMoveList = (position: number) => {
    dispatchCustomEvent('epitrello:list-moved', {
      listId: list.id,
      newPosition: position,
      boardId: 'current',
    });

    setShowMoveDialog(false);
  };

  const handleMoveAllCards = (targetListId: string) => {
    if (!targetListId) return;

    dispatchCustomEvent('epitrello:move-all-cards', {
      sourceListId: list.id,
      targetListId: targetListId,
      cards: [...cards],
    });

    setCards([]);
    setShowMoveAllCardsDialog(false);
  };

  const handleDeleteList = () => {
    dispatchCustomEvent('epitrello:list-deleted', { listId: list.id });
    setShowDeleteDialog(false);
  };

  const handleSort = (sortOption: SortOption) => {
    setActiveSortOption(sortOption);

    const sortedCards = [...cards];

    switch (sortOption) {
      case 'date-newest':
        sortedCards.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // Newest first
        });
        break;
      case 'date-oldest':
        sortedCards.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB; // Oldest first
        });
        break;
      case 'due-date':
        sortedCards.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1; // Cards without due date go to the end
          if (!b.dueDate) return -1;
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          return dateA - dateB; // Earliest due date first
        });
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
  };

  // Drag & drop handlers
  const handleCardDragStart = (
    e: React.DragEvent,
    cardId: string,
    fromIndex?: number
  ) => {
    console.log('🎬 Drag start:', {
      cardId,
      isTemp: cardId?.startsWith('temp-'),
      fromIndex,
      listId: list.id,
    });

    // CRITICAL: Extra safety check - should not reach here due to draggable=false, but just in case
    if (cardId?.startsWith('temp-')) {
      console.warn('⚠️ Attempted to drag temporary card:', cardId);
      e.preventDefault();
      return;
    }

    try {
      const fromIndexCalculated =
        typeof fromIndex === 'number'
          ? fromIndex
          : cards.findIndex((c) => c.id === cardId);

      const dragData = {
        cardId,
        fromListId: list.id,
        fromIndex: fromIndexCalculated,
      };
      e.dataTransfer.setData('application/json', JSON.stringify(dragData));
      e.dataTransfer.effectAllowed = 'move';

      console.log('📦 Drag data set:', dragData);

      // Dispatch snapshot event - store full board state before drag
      dispatchCustomEvent('epitrello:drag-start', {
        cardId,
        fromListId: list.id,
        fromIndex: fromIndexCalculated,
      });

      // Set drag image for better UX
      const draggedCard = cards.find((c) => c.id === cardId);
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
      const cardElements =
        e.currentTarget.parentElement?.querySelectorAll('[draggable="true"]');
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
    if (readOnly) {
      setDragOverIndex(null);
      return;
    }

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
        isTemp: data?.cardId?.startsWith('temp-'),
      });

      if (!data?.cardId) {
        setDragOverIndex(null);
        return;
      }

      let targetIndex = dragOverIndex !== null ? dragOverIndex : cards.length;
      const fromIndex = data.fromIndex;
      const isIntralistMove = data.fromListId === list.id;

      if (isIntralistMove && (fromIndex === -1 || targetIndex === fromIndex)) {
        setDragOverIndex(null);
        return;
      }

      if (isIntralistMove && fromIndex < targetIndex) {
        targetIndex = Math.max(0, targetIndex - 1);
      }

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

    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
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
      className={`w-[272px] min-w-[272px] shrink-0 rounded-2xl flex flex-col animate-slide-in transition-all duration-200 ${
        isDragOver
          ? 'bg-primary/20 ring-2 ring-primary shadow-lg'
          : 'bg-white dark:bg-black'
      }`}
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {/* Header */}
      <div className='p-4 pb-3 shrink-0'>
        <div className='flex items-center justify-between gap-2'>
          {!editing ? (
            <h3
              className={`font-medium text-foreground text-sm flex-1 ${
                !readOnly ? 'cursor-text' : ''
              }`}
              onClick={() => !readOnly && setEditing(true)}
              title={readOnly ? undefined : 'Click to edit'}
              {...(readOnly ? {} : dragHandleProps)}
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
                if (e.key === 'Enter') {
                  (e.target as HTMLInputElement).blur();
                } else if (e.key === 'Escape') {
                  setEditing(false);
                  setTitle(list.title || 'Untitled');
                }
              }}
              className='flex-1 h-auto p-2 text-sm'
            />
          )}

          {!readOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className={`transition-all duration-200 ${
                    isHoveringColumn ? 'opacity-100' : 'opacity-30'
                  }`}
                  title='Column actions'
                  aria-label='Column actions menu'
                >
                  <MoreVertical
                    className='w-4 h-4 text-muted-foreground'
                    aria-hidden='true'
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56 border-accent'>
                <DropdownMenuLabel>List actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setAddingCard(true)}>
                  <Plus className='w-4 h-4' />
                  <span>Add card</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setShowCopyDialog(true)}>
                  <Copy className='w-4 h-4' />
                  <span>Copy list</span>
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger disabled={totalListsCount <= 1}>
                    <Move className='w-4 h-4' />
                    <span>Move</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className='border-accent'>
                    <DropdownMenuItem
                      onClick={() => {
                        if (totalListsCount > 1) setShowMoveDialog(true);
                      }}
                      disabled={totalListsCount <= 1}
                    >
                      <ArrowRight className='w-4 h-4' />
                      <span>Move list</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (totalListsCount > 1 && cards.length > 0)
                          setShowMoveAllCardsDialog(true);
                      }}
                      disabled={totalListsCount <= 1 || cards.length === 0}
                    >
                      <ArrowRight className='w-4 h-4' />
                      <span>Move all cards</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger disabled={cards.length === 0}>
                    <ArrowUpDown className='w-4 h-4' />
                    <span>Sort by</span>
                    {activeSortOption && cards.length > 0 && (
                      <span className='ml-auto text-xs text-primary'>●</span>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className='border-accent'>
                    <DropdownMenuRadioGroup
                      value={activeSortOption || undefined}
                      onValueChange={(value) => {
                        if (value) handleSort(value as SortOption);
                      }}
                    >
                      {sortOptions.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                          disabled={cards.length === 0}
                        >
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('epitrello:list-archived', {
                        detail: { listId: list.id },
                      })
                    );
                  }}
                >
                  <Archive className='w-4 h-4' />
                  <span>Archive list</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant='destructive'
                  className='text-red-600'
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className='w-4 h-4' />
                  <span>Delete list</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ListColumnDialogs
            listTitle={title}
            listId={list.id}
            cardsCount={cards.length}
            totalListsCount={totalListsCount}
            allLists={allLists}
            showCopyDialog={showCopyDialog}
            setShowCopyDialog={setShowCopyDialog}
            showMoveDialog={showMoveDialog}
            setShowMoveDialog={setShowMoveDialog}
            showMoveAllCardsDialog={showMoveAllCardsDialog}
            setShowMoveAllCardsDialog={setShowMoveAllCardsDialog}
            showDeleteDialog={showDeleteDialog}
            setShowDeleteDialog={setShowDeleteDialog}
            onCopyList={handleCopyList}
            onMoveList={handleMoveList}
            onMoveAllCards={handleMoveAllCards}
            onDeleteList={handleDeleteList}
          />
        </div>
      </div>

      {/* Cards area */}
      <div
        className={`overflow-y-auto overflow-x-hidden px-2 space-y-3 scrollbar-hidden ${
          cards.length > 0 ? 'max-h-full' : ''
        }`}
      >
        {cards.length === 0 && dragOverIndex === 0 && (
          <div className='h-20 border-2 border-dashed border-indigo-300 bg-primary/20 rounded-xl flex items-center justify-center animate-drag-placeholder'>
            <span className='text-indigo-400 text-sm font-medium'>
              Drop card here
            </span>
          </div>
        )}
        {cards.map((c, i) => (
          <div key={`${c.id}-${i}`} className='relative animate-fade-in'>
            {dragOverIndex === i && (
              <div className='mb-2 h-2 bg-linear-to-r from-indigo-400 to-indigo-500 rounded-full shadow-lg animate-drag-placeholder' />
            )}
            <CardItem
              card={c}
              index={i}
              onDragStart={readOnly ? undefined : handleCardDragStart}
              onDragOver={readOnly ? undefined : handleCardDragOver}
              availableLists={allLists.map((l) => ({
                id: l.id,
                name: l.title,
              }))}
              currentBoardId={boardId}
              readOnly={readOnly}
            />
          </div>
        ))}
        {dragOverIndex === cards.length && cards.length > 0 && (
          <div className='h-2 bg-linear-to-r from-(--trello-blue) to-(--trello-blue-hover) rounded-full shadow-lg animate-drag-placeholder' />
        )}
      </div>

      {/* Footer - hide when read only */}
      {!readOnly && (
        <div className='p-2 border-accent shrink-0'>
          {!addingCard ? (
            <Button
              ref={addButtonRef}
              onClick={() => setAddingCard(true)}
              variant='secondary'
              className='w-full justify-start rounded-xl cursor-pointer hover:bg-primary'
              aria-label='Add a card'
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
      )}
    </div>
  );
}
