'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface RemoveMemberPopoverProps {
  /** Trigger button content (e.g. "Remove...") */
  trigger: React.ReactNode;
  userId: string;
  onRemoveFromWorkspace: (userId: string) => Promise<void>;
  onRemoveFromWorkspaceAndBoards: (userId: string) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export function RemoveMemberPopover({
  trigger,
  userId,
  onRemoveFromWorkspace,
  onRemoveFromWorkspaceAndBoards,
  loading = false,
  disabled = false,
}: RemoveMemberPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleRemoveFromWorkspace = async () => {
    try {
      await onRemoveFromWorkspace(userId);
      setOpen(false);
    } catch {
      // Error handled by parent
    }
  };

  const handleRemoveFromWorkspaceAndBoards = async () => {
    try {
      await onRemoveFromWorkspaceAndBoards(userId);
      setOpen(false);
    } catch {
      // Error handled by parent
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        className='w-80 border-accent p-4'
        align='end'
        side='bottom'
      >
        <h3 className='font-semibold text-foreground mb-4'>Remove member</h3>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <p className='text-sm text-foreground'>
              The member will lose access to the list of Workspace boards and
              Workspace members. They will retain access to all the boards and
              cards they are currently a member of. They will receive a
              notification.
            </p>
            <Button
              variant='secondary'
              className='w-full  hover:bg-accent hover:text-foreground active:scale-[0.98] transition-all duration-150'
              onClick={handleRemoveFromWorkspace}
              disabled={loading}
            >
              {loading ? 'Removing...' : 'Remove from Workspace'}
            </Button>
          </div>
          <Separator className='bg-accent' />
          <div className='space-y-2'>
            <p className='text-sm text-foreground'>
              The user will lose access to the list of Workspace boards and
              Workspace members. They will be removed from all the boards and
              cards they are currently a member of. They will receive a
              notification.
            </p>
            <Button
              variant='secondary'
              className='w-full bg-muted hover:bg-accent hover:text-foreground active:scale-[0.98] transition-all duration-150'
              onClick={handleRemoveFromWorkspaceAndBoards}
              disabled={loading}
            >
              {loading ? 'Removing...' : 'Remove from Workspace and Boards'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
