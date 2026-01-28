'use client';

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface CardModalChecklistPopoverProps {
  newChecklistTitle: string;
  onSetNewChecklistTitle: (title: string) => void;
  onCreateChecklist: () => void;
  trigger: React.ReactNode;
}

export function CardModalChecklistPopover({
  newChecklistTitle,
  onSetNewChecklistTitle,
  onCreateChecklist,
  trigger,
}: CardModalChecklistPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleCreate = () => {
    if (newChecklistTitle.trim()) {
      onCreateChecklist();
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newChecklistTitle.trim()) {
      handleCreate();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align='start' className='w-64 p-3 border-accent'>
        <h4 className='text-sm font-semibold text-trello mb-3'>
          Add Checklist
        </h4>
        <div className='space-y-3'>
          <Input
            placeholder='Checklist title...'
            value={newChecklistTitle}
            onChange={(e) => onSetNewChecklistTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className='w-full'
            autoFocus
          />
          <div className='flex gap-2'>
            <Button
              onClick={handleCreate}
              size='sm'
              className='flex-1'
              disabled={!newChecklistTitle.trim()}
            >
              Add
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant='ghost'
              size='sm'
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
