import { useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type {
  WorkspaceMemberWithUser,
  GqlBoard,
} from '@/lib/actions/workspaces';
import { MemberItem } from './MemberItem';
import type { MemberBoardItem } from './MemberBoardsPopover';

interface GuestsTabContentProps {
  members: WorkspaceMemberWithUser[];
  onRemove: (userId: string) => void;
  removing: string | null;
  canRemove?: boolean;
  workspaceBoards?: GqlBoard[];
  /** Current user id to show "Leave" instead of "Remove" for own row. */
  currentUserId?: string;
}

function getBoardsForMember(
  boards: GqlBoard[] | undefined,
  userId: string,
): MemberBoardItem[] {
  if (!boards?.length) return [];
  return boards
    .filter((b) => b.members?.some((m) => m.userId === userId))
    .map((b) => ({
      id: b.id,
      title: b.title,
      background: b.background,
    }));
}

export function GuestsTabContent({
  members,
  onRemove,
  removing,
  canRemove = true,
  workspaceBoards,
  currentUserId,
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
                canRemove={canRemove}
                memberBoards={getBoardsForMember(
                  workspaceBoards,
                  guest.userId,
                )}
                isCurrentUser={currentUserId === guest.userId}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
