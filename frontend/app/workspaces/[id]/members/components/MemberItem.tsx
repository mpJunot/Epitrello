import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { X, HelpCircle } from 'lucide-react';
import type { WorkspaceMemberWithUser } from '@/lib/actions/workspaces';
import { getInitials, formatLastActive, getAvatarColor } from './utils';
import {
  MemberBoardsPopover,
  type MemberBoardItem,
} from './MemberBoardsPopover';
import {
  LeaveWorkspacePopover,
  type MemberToPromote,
} from './LeaveWorkspacePopover';
import { RemoveMemberPopover } from './RemoveMemberPopover';

interface MemberItemProps {
  member: WorkspaceMemberWithUser;
  /** Called when current user confirms "Leave Workspace" in popover. */
  onLeaveWorkspace?: () => Promise<void>;
  /** When current user is the only admin, members that can be promoted. */
  otherMembersToPromote?: MemberToPromote[];
  /** Called when current user promotes another member to admin (before leaving). */
  onAssignAdmin?: (userId: string) => Promise<void>;
  /** Called when admin chooses "Remove from Workspace" in popover. */
  onRemoveFromWorkspace?: (userId: string) => Promise<void>;
  /** Called when admin chooses "Remove from Workspace and Boards" in popover. */
  onRemoveFromWorkspaceAndBoards?: (userId: string) => Promise<void>;
  isRemoving: boolean;
  /** If false, the remove/leave button is hidden (non-admin for remove). */
  canRemove?: boolean;
  /** Boards this member is part of in the workspace (for "View boards" popover). */
  memberBoards?: MemberBoardItem[];
  /** If true, show "Leave..." popover instead of "Remove..." (current user). */
  isCurrentUser?: boolean;
  /** When true, current user is the only admin and must assign another admin before leaving. */
  isOnlyAdmin?: boolean;
}

export function MemberItem({
  member,
  onLeaveWorkspace,
  otherMembersToPromote,
  onAssignAdmin,
  onRemoveFromWorkspace,
  onRemoveFromWorkspaceAndBoards,
  isRemoving,
  canRemove = true,
  memberBoards = [],
  isCurrentUser = false,
  isOnlyAdmin = false,
}: MemberItemProps) {
  const memberName = member.user.name || member.user.email || 'This member';

  const removeLeaveTrigger = (
    <Button
      variant='ghost'
      size='sm'
      disabled={isRemoving}
      className='text-destructive hover:text-destructive hover:bg-destructive/15 active:bg-destructive/20 transition-colors'
    >
      <X className='h-4 w-4' />
      {isRemoving
        ? isCurrentUser
          ? 'Leaving...'
          : 'Removing...'
        : isCurrentUser
        ? 'Leave...'
        : 'Remove...'}
    </Button>
  );

  return (
    <Item variant='outline' className='border-accent hover:bg-accent/50'>
      <ItemMedia>
        <Avatar className='size-10'>
          <AvatarImage
            src={member.user.avatar || undefined}
            alt={member.user.name}
          />
          <AvatarFallback
            className={`text-white ${getAvatarColor(
              member.user.name || member.user.email
            )}`}
          >
            {getInitials(member.user.name)}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{member.user.name}</ItemTitle>
        <ItemDescription>
          <span className='flex items-center gap-2'>
            @{member.user.email.split('@')[0]}
            <span className='text-xs'>{formatLastActive(member.joinedAt)}</span>
          </span>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <MemberBoardsPopover memberName={memberName} boards={memberBoards} />
        <Button variant='outline' size='sm' className='border-border'>
          Admin
          <HelpCircle className='h-3 w-3 ml-1' />
        </Button>
        {canRemove &&
          (isCurrentUser
            ? onLeaveWorkspace && (
                <LeaveWorkspacePopover
                  trigger={removeLeaveTrigger}
                  onConfirm={onLeaveWorkspace}
                  isOnlyAdmin={isOnlyAdmin}
                  otherMembers={otherMembersToPromote}
                  onAssignAdmin={onAssignAdmin}
                  loading={isRemoving}
                  disabled={isRemoving}
                />
              )
            : onRemoveFromWorkspace &&
              onRemoveFromWorkspaceAndBoards && (
                <RemoveMemberPopover
                  trigger={removeLeaveTrigger}
                  userId={member.userId}
                  onRemoveFromWorkspace={onRemoveFromWorkspace}
                  onRemoveFromWorkspaceAndBoards={
                    onRemoveFromWorkspaceAndBoards
                  }
                  loading={isRemoving}
                  disabled={isRemoving}
                />
              ))}
      </ItemActions>
    </Item>
  );
}
