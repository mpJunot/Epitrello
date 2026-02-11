'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import ListColumn from './ListColumn';
import { getSortableStyle } from './sortable-utils';
import type { List } from '@/app/boards/[id]/types';

type SortableColumnProps = {
  list: List;
  totalListsCount: number;
  allLists: List[];
  boardId: string;
  canEdit: boolean;
  draggingCardListId: string | null;
  dropTargetListId: string | null;
};

export function SortableColumn({
  list,
  totalListsCount,
  allLists,
  boardId,
  canEdit,
  draggingCardListId,
  dropTargetListId,
}: SortableColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: list.id, disabled: !canEdit });

  return (
    <div
      ref={setNodeRef}
      style={getSortableStyle(transform, transition, isDragging)}
      className='snap-center md:snap-align-none'
    >
      <ListColumn
        list={list}
        totalListsCount={totalListsCount}
        allLists={allLists}
        boardId={boardId}
        readOnly={!canEdit}
        dragHandleProps={canEdit ? { ...attributes, ...listeners } : undefined}
        draggingCardListId={draggingCardListId}
        dropTargetListId={dropTargetListId}
      />
    </div>
  );
}
