import { useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { WorkspaceMemberWithUser } from '@/lib/actions/workspaces';
import { MemberItem } from './MemberItem';

interface GuestsTabContentProps {
  members: WorkspaceMemberWithUser[];
  onRemove: (userId: string) => void;
  removing: string | null;
}

export function GuestsTabContent({
  members,
  onRemove,
  removing,
}: GuestsTabContentProps) {
  // Filter members with GUEST role (if role is implemented as enum)
  // For now, we'll show empty since guests might not be implemented yet
  const guests = useMemo(() => {
    // If guests are members with role === 'GUEST', filter them
    // Otherwise return empty array
    return members.filter((m) => m.role === 'GUEST');
  }, [members]);

  return (
    <div className='flex-1 flex flex-col mt-0'>
      <div className='shrink-0'>
        <h2 className='text-2xl font-bold text-foreground mb-2'>
          Guests ({guests.length})
        </h2>
        <p className='text-sm text-muted-foreground'>
          Guests have limited access to specific boards. They can view and edit
          only the boards they are invited to.
        </p>
      </div>

      <Separator className='shrink-0 my-4 h-px bg-accent' />

      <ScrollArea className='flex-1 min-h-0'>
        <div className='space-y-2 pr-4'>
          {guests.length === 0 ? (
            <div className='text-center py-12 text-muted-foreground'>
              No guests in this workspace
            </div>
          ) : (
            guests.map((guest) => (
              <MemberItem
                key={guest.id}
                member={guest}
                onRemove={onRemove}
                isRemoving={removing === guest.userId}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
