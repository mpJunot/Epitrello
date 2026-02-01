'use client';

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ListColumn from './ListColumn';
import type { Board, List } from '@/app/boards/[id]/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** Descriptions pour les options de visibilité du board (Private, Workspace, Public). */
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

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canEdit) return;
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = lists.findIndex((list) => list.id === active.id);
    const newIndex = lists.findIndex((list) => list.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      window.dispatchEvent(
        new CustomEvent('epitrello:list-moved', {
          detail: {
            listId: active.id as string,
            newPosition: newIndex,
            boardId: board.id,
          },
        }),
      );
    }
  };

  const listIds = useMemo(() => lists.map((l) => l.id), [lists]);

  return (
    <div id='main-board-content' className='h-full'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
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
              />
            ))}

            {canEdit && (
              <div className='w-[272px] min-w-[272px] shrink-0 p-3 rounded-md snap-center md:snap-align-none'>
                <AddListInline />
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableColumn({
  list,
  totalListsCount,
  allLists,
  boardId,
  canEdit,
}: {
  list: List;
  totalListsCount: number;
  allLists: List[];
  boardId: string;
  canEdit: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id, disabled: !canEdit });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='snap-center md:snap-align-none'
    >
      <ListColumn
        list={list}
        totalListsCount={totalListsCount}
        allLists={allLists}
        boardId={boardId}
        readOnly={!canEdit}
        dragHandleProps={canEdit ? { ...attributes, ...listeners } : undefined}
      />
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
          className='w-full justify-start hover:bg-trello-blue-hover'
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
