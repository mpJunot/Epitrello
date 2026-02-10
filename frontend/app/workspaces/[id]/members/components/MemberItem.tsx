'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getInitials, formatLastActive, getAvatarColor } from './utils';
import { MemberBoardsPopover } from './MemberBoardsPopover';
import { LeaveWorkspacePopover } from './LeaveWorkspacePopover';
import { RemoveMemberPopover } from './RemoveMemberPopover';
import type { WorkspaceMemberWithUser } from '@/lib/actions/workspaces';
import type { MemberBoardItem } from './MemberBoardsPopover';
import type { MemberToPromote } from './LeaveWorkspacePopover';

interface MemberItemProps {
  member: WorkspaceMemberWithUser;
  onLeaveWorkspace?: () => Promise<void>;
  onRemoveFromWorkspace?: (userId: string) => Promise<void>;
  onRemoveFromWorkspaceAndBoards?: (userId: string) => Promise<void>;
  removing: string | null;
  canRemove?: boolean;
  canUpdateRole?: boolean;
  onRoleChange?: (userId: string, role: string) => Promise<void>;
  memberBoards: MemberBoardItem[];
  isCurrentUser: boolean;
  isOnlyAdmin?: boolean;
  otherMembersToPromote?: MemberToPromote[];
  onAssignAdmin?: (userId: string) => Promise<void>;
}

export function MemberItem({
  member,
  onLeaveWorkspace,
  onRemoveFromWorkspace,
  onRemoveFromWorkspaceAndBoards,
  removing,
  canRemove = true,
  canUpdateRole = false,
  onRoleChange,
  memberBoards,
  isCurrentUser,
  isOnlyAdmin = false,
  otherMembersToPromote = [],
  onAssignAdmin,
}: MemberItemProps) {
  const [updatingRole, setUpdatingRole] = useState(false);
  const isRemoving = removing === member.userId;
  const memberName = member.user?.name || member.user?.email || 'Member';

  const handleRoleChange = async (role: string) => {
    if (!onRoleChange) return;
    setUpdatingRole(true);
    try {
      await onRoleChange(member.userId, role);
    } finally {
      setUpdatingRole(false);
    }
  };

  const roleLabel =
    member.role === 'ADMIN'
      ? 'Admin'
      : member.role === 'OBSERVER'
        ? 'Guest'
        : 'Member';

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
            className='object-cover'
          />
          <AvatarFallback
            className={`text-white ${getAvatarColor(
              member.user.name || member.user.email,
            )}`}
          >
            {getInitials(member.user.name || member.user.email || 'U')}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{member.user.name}</ItemTitle>
        <ItemDescription>
          <span className='flex items-center gap-2 flex-wrap'>
            {member.user.email && (
              <span className='text-muted-foreground'>{member.user.email}</span>
            )}
            <span className='text-xs'>{formatLastActive(member.joinedAt)}</span>
          </span>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <MemberBoardsPopover memberName={memberName} boards={memberBoards} />
        {canUpdateRole && onRoleChange ? (
          <Select
            value={member.role}
            onValueChange={handleRoleChange}
            disabled={updatingRole}
          >
            <SelectTrigger className='w-28 h-8 text-xs border-accent'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='border-accent'>
              <SelectItem value='ADMIN'>Admin</SelectItem>
              <SelectItem value='MEMBER'>Member</SelectItem>
              <SelectItem value='OBSERVER'>Guest</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span
            className='text-xs font-medium px-2 py-1 rounded border border-accent bg-muted/30 text-muted-foreground'
            title={`Role: ${member.role}`}
          >
            {roleLabel}
          </span>
        )}
        {isCurrentUser
          ? onLeaveWorkspace && (
              <LeaveWorkspacePopover
                trigger={removeLeaveTrigger}
                onConfirm={onLeaveWorkspace}
                isOnlyAdmin={isOnlyAdmin}
                otherMembers={otherMembersToPromote}
                onAssignAdmin={onAssignAdmin}
                loading={isRemoving}
              />
            )
          : canRemove &&
            onRemoveFromWorkspace &&
            onRemoveFromWorkspaceAndBoards && (
              <RemoveMemberPopover
                trigger={removeLeaveTrigger}
                userId={member.userId}
                onRemoveFromWorkspace={onRemoveFromWorkspace}
                onRemoveFromWorkspaceAndBoards={onRemoveFromWorkspaceAndBoards}
                loading={isRemoving}
              />
            )}
      </ItemActions>
    </Item>
  );
}
