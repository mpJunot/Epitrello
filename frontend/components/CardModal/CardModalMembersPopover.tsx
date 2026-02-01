'use client';

import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CardModalMembers } from './CardModalMembers';
import type { UserRef } from './types';

export interface CardModalMembersPopoverProps {
  availableMembers: UserRef[];
  assignedMembers: UserRef[];
  onToggleMember: (member: UserRef) => void;
  trigger: React.ReactNode;
}

export function CardModalMembersPopover({
  availableMembers,
  assignedMembers,
  onToggleMember,
  trigger,
}: CardModalMembersPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align='start' className='w-80 p-3 border-accent'>
        <CardModalMembers
          availableMembers={availableMembers}
          assignedMembers={assignedMembers}
          onToggleMember={onToggleMember}
        />
      </PopoverContent>
    </Popover>
  );
}
