'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { formatDueDate, getDueDateStatus } from './utils';
import type { DueDate } from './types';
import { CardModalDatesOverduePopover } from './CardModalDatesOverduePopover';
import { CardModalDatesEditPopover } from './CardModalDatesEditPopover';

export interface CardModalDatesProps {
  startDate?: string;
  dueDate?: DueDate;
  selectedStartDate: string;
  selectedDate: string;
  onSetSelectedStartDate: (date: string) => void;
  onSetSelectedDate: (date: string) => void;
  onSaveStartDate: () => void;
  onRemoveStartDate: () => void;
  onSaveDueDate: () => void;
  onRemoveDueDate: () => void;
  isMovePopoverOpen: boolean;
  onMovePopoverOpenChange: (open: boolean) => void;
  moveCardContent: React.ReactNode;
}

export function CardModalDates({
  startDate,
  dueDate,
  selectedStartDate,
  selectedDate,
  onSetSelectedStartDate,
  onSetSelectedDate,
  onSaveStartDate,
  onRemoveStartDate,
  onSaveDueDate,
  onRemoveDueDate,
  isMovePopoverOpen,
  onMovePopoverOpenChange,
  moveCardContent,
}: CardModalDatesProps) {
  if (!startDate && !dueDate) return null;

  const formatDateRange = () => {
    if (startDate && dueDate) {
      const startFormatted = formatDueDate(startDate);
      const dueFormatted = formatDueDate(dueDate.date);
      const time = new Date(dueDate.date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${startFormatted} - ${dueFormatted}, ${time}`;
    } else if (dueDate) {
      const dueFormatted = formatDueDate(dueDate.date);
      const time = new Date(dueDate.date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${dueFormatted}, ${time}`;
    } else if (startDate) {
      const startFormatted = formatDueDate(startDate);
      const time = new Date(startDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${startFormatted}, ${time}`;
    }
    return '';
  };

  const isOverdue = dueDate && getDueDateStatus(dueDate) === 'overdue';

  return (
    <div>
      <h3 className='text-sm font-semibold text-trello mb-2'>Dates</h3>
      <div className='flex items-center gap-2'>
        <CardModalDatesEditPopover
          startDate={startDate}
          dueDate={dueDate}
          selectedStartDate={selectedStartDate}
          selectedDate={selectedDate}
          onSetSelectedStartDate={onSetSelectedStartDate}
          onSetSelectedDate={onSetSelectedDate}
          onSaveStartDate={onSaveStartDate}
          onRemoveStartDate={onRemoveStartDate}
          onSaveDueDate={onSaveDueDate}
          onRemoveDueDate={onRemoveDueDate}
          trigger={
            <div className='flex items-center gap-2 bg-trello-hover hover:bg-trello-border px-3 py-2 rounded-md text-sm text-trello transition-colors cursor-pointer'>
              <span>{formatDateRange()}</span>
              {isOverdue && (
                <CardModalDatesOverduePopover
                  isOpen={isMovePopoverOpen}
                  onOpenChange={onMovePopoverOpenChange}
                  moveCardContent={moveCardContent}
                />
              )}
              <ChevronDown className='w-4 h-4 text-trello-text-secondary shrink-0' />
            </div>
          }
        />
      </div>
    </div>
  );
}
