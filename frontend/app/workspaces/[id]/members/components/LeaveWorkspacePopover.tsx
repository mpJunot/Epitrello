'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface MemberToPromote {
  userId: string;
  name: string;
  email: string;
}

interface LeaveWorkspacePopoverProps {
  /** Trigger button content (e.g. "Leave...") */
  trigger: React.ReactNode;
  onConfirm: () => Promise<void>;
  /** When true, user is the only admin and must assign another admin first. */
  isOnlyAdmin?: boolean;
  /** Other members (non-admin) that can be promoted to admin. */
  otherMembers?: MemberToPromote[];
  /** Called when user promotes another member to admin. */
  onAssignAdmin?: (userId: string) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export function LeaveWorkspacePopover({
  trigger,
  onConfirm,
  isOnlyAdmin = false,
  otherMembers = [],
  onAssignAdmin,
  loading = false,
  disabled = false,
}: LeaveWorkspacePopoverProps) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  const handleLeave = async () => {
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // Error handled by parent (toast)
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedUserId || !onAssignAdmin) return;
    setAssigning(true);
    try {
      await onAssignAdmin(selectedUserId);
      setOpen(false);
    } catch {
      // Error handled by parent
    } finally {
      setAssigning(false);
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
        {isOnlyAdmin && otherMembers.length > 0 ? (
          <>
            <h3 className='font-semibold text-foreground mb-2'>
              Assign an admin before leaving
            </h3>
            <p className='text-sm text-foreground mb-4'>
              You are the last admin. Choose a member to assign as admin, then
              you can leave the workspace.
            </p>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger className='w-full mb-3'>
                <SelectValue placeholder='Select a member...' />
              </SelectTrigger>
              <SelectContent>
                {otherMembers.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.name || m.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className='flex justify-end'>
              <Button
                onClick={handleAssignAdmin}
                disabled={assigning || !selectedUserId}
                className='bg-orange-500 hover:bg-orange-600 hover:shadow-md active:scale-[0.98] text-white border-0 transition-all duration-150'
              >
                {assigning ? 'Assigning...' : 'Assign as admin'}
              </Button>
            </div>
          </>
        ) : isOnlyAdmin && otherMembers.length === 0 ? (
          <>
            <h3 className='font-semibold text-foreground mb-2'>
              Assign an admin before leaving
            </h3>
            <p className='text-sm text-foreground'>
              You are the last admin. Invite another member to the workspace,
              then assign them as admin before leaving.
            </p>
          </>
        ) : (
          <>
            <h3 className='font-semibold text-foreground mb-2'>
              Leave Workspace
            </h3>
            <p className='text-sm text-foreground mb-4'>
              You will become a guest of this Workspace and will only be able to
              access boards you are currently a member of.
            </p>
            <div className='flex justify-end'>
              <Button
                onClick={handleLeave}
                disabled={loading}
                className='bg-orange-500 hover:bg-orange-600 hover:shadow-md active:scale-[0.98] text-white border-0 transition-all duration-150'
              >
                {loading ? 'Leaving...' : 'Leave Workspace'}
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
