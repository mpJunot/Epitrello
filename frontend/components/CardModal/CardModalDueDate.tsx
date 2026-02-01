'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { DueDate } from './types';

export interface CardModalDueDateProps {
  dueDate: DueDate;
  formatDueDate: (date: string) => string;
  getDueDateStatus: (d: DueDate) => string;
  isMovePopoverOpen: boolean;
  onMovePopoverOpenChange: (open: boolean) => void;
  moveCardContent: React.ReactNode;
}

export function CardModalDueDate({
  dueDate,
  formatDueDate,
  getDueDateStatus,
  isMovePopoverOpen,
  onMovePopoverOpenChange,
  moveCardContent,
}: CardModalDueDateProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-trello mb-2">Due date</h3>
      <div className="flex items-center gap-2">
        <div className="text-sm text-trello">
          {formatDueDate(dueDate.date)},{' '}
          {new Date(dueDate.date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
        {getDueDateStatus(dueDate) === 'overdue' && (
          <Popover
            open={isMovePopoverOpen}
            onOpenChange={onMovePopoverOpenChange}
          >
            <PopoverTrigger asChild>
              <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full cursor-pointer hover:bg-red-600">
                <span className="text-xs font-medium">Overdue</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 p-4 border-accent">
              {moveCardContent}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
