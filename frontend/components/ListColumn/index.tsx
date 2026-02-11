'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, ListColumnProps, SortOption } from './types';
import { dispatchCustomEvent, generateId, createCardsSignature } from './utils';
import { useFocusWhen } from './hooks';
import { CardComposer } from './components/CardComposer';
import { ListColumnDialogs } from './components/ListColumnDialogs';
import { SortableCard } from './components/SortableCard';
import {
  GripVertical,
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
  draggingCardListId = null,
  dropTargetListId = null,
}: ListColumnProps) {
  const [cards, setCards] = useState<Card[]>(list.cards || []);
  const [lastLocalChange, setLastLocalChange] = useState<number>(0);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title || 'Untitled');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [addingCard, setAddingCard] = useState(false);
  const droppableId = `list-drop-${list.id}`;
  const { setNodeRef: setDroppableRef, isOver: isDropOver } = useDroppable({
    id: droppableId,
  });
  const isDropTarget =
    (isDropOver || dropTargetListId === list.id) &&
    draggingCardListId != null &&
    draggingCardListId !== list.id;
  const showDropHighlight = isDropTarget;
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
    const hasNewCardsFromParent =
      (incoming?.length ?? 0) > (cards?.length ?? 0);
    if (!hasNewCardsFromParent && Date.now() - lastLocalChange < 400) return;

    queueMicrotask(() => setCards(incoming));
  }, [list.cards, cards, lastLocalChange, list.id, list.title]);

  useEffect(() => {
    queueMicrotask(() => setTitle(list.title || 'Untitled'));
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
          return dateB - dateA;
        });
        break;
      case 'date-oldest':
        sortedCards.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'due-date':
        sortedCards.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          return dateA - dateB;
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

  return (
    <div
      ref={setDroppableRef}
      onMouseEnter={() => setIsHoveringColumn(true)}
      onMouseLeave={() => setIsHoveringColumn(false)}
      className={`w-[272px] min-w-[272px] shrink-0 rounded-2xl flex flex-col animate-slide-in transition-all duration-200 ${
        showDropHighlight
          ? 'bg-primary/20 ring-2 ring-primary shadow-lg'
          : 'bg-white dark:bg-black'
      }`}
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {/* Header */}
      <div className='p-4 pb-3 shrink-0'>
        <div className='flex items-center justify-between gap-2'>
          {!editing ? (
            <>
              {!readOnly && dragHandleProps && (
                <div
                  {...dragHandleProps}
                  className='shrink-0 cursor-grab active:cursor-grabbing touch-none p-1 -m-1 rounded text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10'
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => {
                    dragHandleProps.onPointerDown?.(e);
                    e.stopPropagation();
                  }}
                  aria-label='Drag to reorder list'
                >
                  <GripVertical className='w-4 h-4' />
                </div>
              )}
              <h3
                className={`font-medium text-foreground text-sm flex-1 min-w-0 ${
                  !readOnly ? 'cursor-text' : ''
                }`}
                onClick={() => !readOnly && setEditing(true)}
                title={readOnly ? undefined : 'Click to edit'}
              >
                {title}
              </h3>
            </>
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
                      }),
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

      <div
        className={`overflow-y-auto overflow-x-hidden px-2 space-y-3 scrollbar-hidden ${
          cards.length > 0 ? 'max-h-full' : ''
        }`}
      >
        {showDropHighlight && cards.length === 0 && (
          <div className='h-20 border-2 border-dashed border-indigo-300 bg-primary/20 rounded-xl flex items-center justify-center animate-drag-placeholder'>
            <span className='text-indigo-400 text-sm font-medium'>
              Drop card here
            </span>
          </div>
        )}
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((c, i) => (
            <SortableCard
              key={c.id}
              card={c}
              index={i}
              readOnly={readOnly}
              availableLists={allLists.map((l) => ({
                id: l.id,
                name: l.title,
              }))}
              boardId={boardId}
            />
          ))}
          {showDropHighlight && cards.length > 0 && (
            <div className='h-12 min-h-[48px] border-2 border-dashed border-indigo-300 bg-primary/10 rounded-xl flex items-center justify-center'>
              <span className='text-indigo-400 text-sm font-medium'>
                Drop here
              </span>
            </div>
          )}
        </SortableContext>
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
