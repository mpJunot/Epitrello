import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import type { WorkspaceInvitation } from '@/lib/graphql-types';

interface RequestItemProps {
  invitation: WorkspaceInvitation;
}

export function RequestItem({ invitation }: RequestItemProps) {
  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Item variant='outline' className='border-accent hover:bg-accent/50'>
      <ItemMedia>
        <div className='size-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium'>
          {getInitials(invitation.inviteeEmail)}
        </div>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{invitation.inviteeEmail}</ItemTitle>
        <ItemDescription>
          <span className='flex items-center gap-2'>
            <span>Invited by {invitation.inviterName || 'Unknown'}</span>
            <span className='text-xs'>
              • Expires {formatDate(invitation.expiresAt)}
            </span>
          </span>
        </ItemDescription>
        <ItemDescription className='text-xs'>
          Role: {invitation.role}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <div className='text-xs text-muted-foreground'>
          Awaiting response
        </div>
      </ItemActions>
    </Item>
  );
}
