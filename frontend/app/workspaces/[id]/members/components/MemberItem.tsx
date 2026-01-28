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

interface MemberItemProps {
  member: WorkspaceMemberWithUser;
  onRemove: (userId: string) => void;
  isRemoving: boolean;
}

export function MemberItem({ member, onRemove, isRemoving }: MemberItemProps) {
  return (
    <Item
      variant='outline'
      className='border-accent hover:bg-accent/50'
    >
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
            <span className='text-xs'>
              {formatLastActive(member.joinedAt)}
            </span>
          </span>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant='outline' size='sm' className='border-border'>
          View boards (0)
        </Button>
        <Button variant='outline' size='sm' className='border-border'>
          Admin
          <HelpCircle className='h-3 w-3 ml-1' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onRemove(member.userId)}
          disabled={isRemoving}
          className='text-destructive hover:text-destructive hover:bg-destructive/10'
        >
          <X className='h-4 w-4' />
          {isRemoving ? 'Removing...' : 'Remove...'}
        </Button>
      </ItemActions>
    </Item>
  );
}
