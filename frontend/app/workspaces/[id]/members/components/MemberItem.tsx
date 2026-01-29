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

interface MemberItemProps {
  member: WorkspaceMemberWithUser;
  onRemove: (userId: string) => void;
  isRemoving: boolean;
  /** If false, the remove button is hidden (non-admin). */
  canRemove?: boolean;
  /** Boards this member is part of in the workspace (for "View boards" popover). */
  memberBoards?: MemberBoardItem[];
  /** If true, show "Leave..." instead of "Remove..." (current user). */
  isCurrentUser?: boolean;
}

export function MemberItem({
  member,
  onRemove,
  isRemoving,
  canRemove = true,
  memberBoards = [],
  isCurrentUser = false,
}: MemberItemProps) {
  const memberName = member.user.name || member.user.email || 'This member';

  return (
    <Item variant='outline' className='border-accent hover:bg-accent/50'>
      <ItemMedia>
        <Avatar className='size-10'>
          <AvatarImage
            src={member.user.avatar || undefined}
            alt={member.user.name}
          />
          <AvatarFallback
            className={`text-white ${getAvatarColor(member.user.name || member.user.email)}`}
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
        {canRemove && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onRemove(member.userId)}
            disabled={isRemoving}
            className='text-destructive hover:text-destructive hover:bg-destructive/10'
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
        )}
      </ItemActions>
    </Item>
  );
}
