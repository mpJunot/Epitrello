'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import CardItem from '@/components/CardItem';
import { getSortableStyle } from '@/components/sortable-utils';
import type { Card } from '../types';

type SortableCardProps = {
  card: Card;
  index: number;
  readOnly: boolean;
  availableLists: Array<{ id: string; name: string }>;
  boardId?: string;
};

export function SortableCard({
  card,
  index,
  readOnly,
  availableLists,
  boardId,
}: SortableCardProps) {
  const disabled = readOnly || card.id.startsWith('temp-');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={getSortableStyle(transform, transition, isDragging)}
      className='relative'
    >
      <CardItem
        card={card}
        index={index}
        availableLists={availableLists}
        currentBoardId={boardId}
        readOnly={readOnly}
        dragHandleProps={disabled ? undefined : { ...attributes, ...listeners }}
      />
    </div>
  );
}
