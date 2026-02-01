'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface CardModalDatesOverduePopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  moveCardContent: React.ReactNode;
}

export function CardModalDatesOverduePopover({
  isOpen,
  onOpenChange,
  moveCardContent,
}: CardModalDatesOverduePopoverProps) {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
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
  );
}
