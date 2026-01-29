'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface MemberBoardItem {
  id: string;
  title: string;
  background?: string | null;
}

interface MemberBoardsPopoverProps {
  memberName: string;
  boards: MemberBoardItem[];
}

export function MemberBoardsPopover({
  memberName,
  boards,
}: MemberBoardsPopoverProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleBoardClick = (boardId: string) => {
    setOpen(false);
    router.push(`/boards/${boardId}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='border-border'>
          View boards ({boards.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-72 p-0 border-accent' align='start'>
        <div className='p-3 border-b border-accent'>
          <p className='text-sm font-medium'>Workspace boards</p>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {memberName} is a member of:
          </p>
        </div>
        <ScrollArea className='max-h-64'>
          <ul className='p-2'>
            {boards.length === 0 ? (
              <li className='text-sm text-muted-foreground py-4 text-center'>
                No boards in this workspace
              </li>
            ) : (
              boards.map((board) => (
                <li key={board.id}>
                  <button
                    type='button'
                    onClick={() => handleBoardClick(board.id)}
                    className='w-full text-left text-sm font-medium truncate py-2 px-2 rounded-md hover:bg-accent/50 transition-colors'
                  >
                    {board.title}
                  </button>
                </li>
              ))
            )}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
