'use client';

import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import ListColumn from './ListColumn';
import { SortableColumn } from './SortableColumn';
import CardItem from './CardItem';
import type { Board, List, Card } from '@/app/boards/[id]/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function getVisibilityDescription(
  visibility?: string,
  workspaceName?: string,
): string {
  switch (visibility) {
    case 'PRIVATE':
      return 'Only board members can see this board. Workspace admins can close the board or remove members.';
    case 'WORKSPACE':
      return workspaceName
        ? `All members of the ${workspaceName} Workspace can see and edit this board.`
        : 'All members of the workspace can see and edit this board.';
    case 'PUBLIC':
      return 'Anyone on the internet can see this board. Only board members can edit.';
    default:
      return 'Only board members can see this board. Workspace admins can close the board or remove members.';
  }
}

export default function BoardView({
  board,
  canEdit = true,
}: {
  board: Board;
  canEdit?: boolean;
}) {
  const lists = useMemo(() => board.lists || [], [board.lists]);
  const [draggingCardListId, setDraggingCardListId] = useState<string | null>(
    null,
  );
  const [dropTargetListId, setDropTargetListId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeList, setActiveList] = useState<List | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    console.log('BoardView: board.lists changed, count:', lists.length);
    lists.forEach((l, idx) => {
      console.log(`  List ${idx}:`, l.id, l.title, 'cards:', l.cards?.length);
      l.cards?.forEach((c, cidx) => {
        console.log(`    Card ${cidx}:`, c.id, c.title);
      });
    });
  }, [board, lists]);

  const listIds = useMemo(() => lists.map((l) => l.id), [lists]);

  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const collisions = pointerWithin(args);
      const activeId = String(args.active.id);
      if (!listIds.includes(activeId) || collisions.length === 0)
        return collisions;
      const first = collisions[0];
      const overId = String(first.id);
      const LIST_DROP_PREFIX = 'list-drop-';
      if (overId.startsWith(LIST_DROP_PREFIX)) {
        return [{ ...first, id: overId.slice(LIST_DROP_PREFIX.length) }];
      }
      return collisions;
    },
    [listIds],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (!event.over || !draggingCardListId) {
        setDropTargetListId(null);
        return;
      }
      const overId = String(event.over.id);
      const LIST_DROP_PREFIX = 'list-drop-';
      if (overId.startsWith(LIST_DROP_PREFIX)) {
        setDropTargetListId(overId.slice(LIST_DROP_PREFIX.length));
        return;
      }
      const listContainingCard = lists.find((l) =>
        l.cards?.some((c) => c.id === overId),
      );
      setDropTargetListId(listContainingCard?.id ?? null);
    },
    [draggingCardListId, lists],
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (!canEdit) return;
    const { active } = event;
    const activeId = String(active.id);
    if (listIds.includes(activeId)) {
      setDraggingCardListId(null);
      setActiveCard(null);
      const list = lists.find((l) => l.id === activeId) ?? null;
      setActiveList(list);
      return;
    }
    setActiveList(null);
    const sourceList = lists.find((l) =>
      l.cards?.some((c) => c.id === activeId),
    );
    const card = sourceList?.cards?.find((c) => c.id === activeId) ?? null;
    setActiveCard(card);
    setDraggingCardListId(sourceList?.id ?? null);
    window.dispatchEvent(
      new CustomEvent('epitrello:drag-start', { detail: { cardId: activeId } }),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingCardListId(null);
    setDropTargetListId(null);
    setActiveCard(null);
    setActiveList(null);
    if (!canEdit) return;
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (listIds.includes(activeId)) {
      const LIST_DROP_PREFIX = 'list-drop-';
      const overListId = overId.startsWith(LIST_DROP_PREFIX)
        ? overId.slice(LIST_DROP_PREFIX.length)
        : overId;
      const oldIndex = listIds.indexOf(activeId);
      const newIndex = listIds.indexOf(overListId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        window.dispatchEvent(
          new CustomEvent('epitrello:list-moved', {
            detail: {
              listId: activeId,
              newPosition: newIndex,
              boardId: board.id,
            },
          }),
        );
      }
      return;
    }

    const sourceList = lists.find((l) =>
      l.cards?.some((c) => c.id === activeId),
    );
    if (!sourceList) return;
    const fromIndex =
      sourceList.cards?.findIndex((c) => c.id === activeId) ?? -1;

    const LIST_DROP_PREFIX = 'list-drop-';
    const isDropOnList =
      overId.startsWith(LIST_DROP_PREFIX) || listIds.includes(overId);
    const resolvedListId = overId.startsWith(LIST_DROP_PREFIX)
      ? overId.slice(LIST_DROP_PREFIX.length)
      : overId;

    let targetListId: string;
    let targetIndex: number;
    if (isDropOnList) {
      targetListId = resolvedListId;
      const targetList = lists.find((l) => l.id === targetListId);
      targetIndex = targetList?.cards?.length ?? 0;
    } else {
      const targetList = lists.find((l) =>
        l.cards?.some((c) => c.id === overId),
      );
      if (!targetList) return;
      targetListId = targetList.id;
      targetIndex = targetList.cards?.findIndex((c) => c.id === overId) ?? 0;
    }

    window.dispatchEvent(
      new CustomEvent('epitrello:card-move', {
        detail: {
          cardId: activeId,
          sourceListId: sourceList.id,
          targetListId,
          targetIndex,
          fromIndex,
        },
      }),
    );
  };

  return (
    <div id='main-board-content' className='h-full'>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setDraggingCardListId(null);
          setDropTargetListId(null);
          setActiveCard(null);
          setActiveList(null);
        }}
      >
        <SortableContext
          items={listIds}
          strategy={horizontalListSortingStrategy}
        >
          <div className='h-full p-4 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory md:snap-none items-start [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
            {lists.map((l) => (
              <SortableColumn
                key={l.id}
                list={l}
                totalListsCount={lists.length}
                allLists={lists}
                boardId={board.id}
                canEdit={canEdit}
                draggingCardListId={draggingCardListId}
                dropTargetListId={dropTargetListId}
              />
            ))}

            {canEdit && (
              <div className='w-[272px] min-w-[272px] shrink-0 p-3 rounded-md snap-center md:snap-align-none'>
                <AddListInline />
              </div>
            )}
          </div>
        </SortableContext>

        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          {activeList ? (
            <div
              className='rotate-2 w-[272px] min-w-[272px] rounded-2xl cursor-grabbing overflow-hidden'
              style={{
                boxShadow:
                  '0 12px 28px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1)',
              }}
            >
              <ListColumn
                list={activeList}
                totalListsCount={lists.length}
                allLists={lists}
                boardId={board.id}
                readOnly
                draggingCardListId={null}
              />
            </div>
          ) : activeCard ? (
            <div
              className='rotate-3 shadow-lg rounded-lg cursor-grabbing'
              style={{
                boxShadow:
                  '0 12px 28px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1)',
              }}
            >
              <CardItem
                card={activeCard}
                index={0}
                availableLists={lists.map((l) => ({
                  id: l.id,
                  name: l.title ?? 'Untitled',
                }))}
                currentBoardId={board.id}
                readOnly
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function AddListInline() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const openInput = () => setOpen(true);
  const close = () => {
    setOpen(false);
    setValue('');
    setTimeout(() => buttonRef.current?.focus(), 0);
  };

  const submit = async () => {
    const title = value?.trim();
    if (!title) {
      setError(true);
      setTimeout(() => setError(false), 500);
      return;
    }
    setLoading(true);
    window.dispatchEvent(
      new CustomEvent('epitrello:list-create', { detail: { title } }),
    );
  };

  const handleSuccess = useCallback(() => {
    setLoading(false);
    close();
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
    setTimeout(() => setError(false), 500);
  }, []);

  useEffect(() => {
    window.addEventListener('epitrello:list-create-success', handleSuccess);
    window.addEventListener('epitrello:list-create-error', handleError);
    return () => {
      window.removeEventListener(
        'epitrello:list-create-success',
        handleSuccess,
      );
      window.removeEventListener('epitrello:list-create-error', handleError);
    };
  }, [handleSuccess, handleError]);

  return (
    <div>
      {!open ? (
        <Button
          ref={buttonRef}
          onClick={openInput}
          variant='secondary'
          className='w-full justify-start bg-trello-blue hover:bg-trello-blue-hover'
          aria-label='Add another list'
        >
          + Add another list
        </Button>
      ) : (
        <div className={`rounded-lg ${error ? 'animate-shake' : ''}`}>
          <Input
            ref={inputRef}
            placeholder='Enter list title'
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                close();
              }
            }}
            className={error ? 'border-red-400 bg-red-50' : ''}
          />
          {error && (
            <p className='text-xs text-red-600 mt-1'>Title is required</p>
          )}

          <div className='mt-2 flex items-center gap-2'>
            <Button onClick={submit} disabled={loading} size='sm'>
              {loading ? 'Creating...' : 'Add list'}
            </Button>
            <Button
              onClick={close}
              variant='ghost'
              size='icon'
              aria-label='Cancel add list'
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
