import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface MembersHeaderProps {
  memberCount: number;
  memberLimit: number;
  onInviteClick: () => void;
}

export function MembersHeader({
  memberCount,
  memberLimit,
  onInviteClick,
}: MembersHeaderProps) {
  return (
    <div className='shrink-0'>
      <div className='max-w-7xl mx-auto px-6 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-bold text-foreground'>Collaborators</h1>
          <span className='px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded'>
            {memberCount}/{memberLimit}
          </span>
        </div>
        <Button
          onClick={onInviteClick}
          className='bg-trello-blue hover:bg-trello-blue-hover text-white'
        >
          <UserPlus className='h-4 w-4 mr-2' />
          Invite Workspace members
        </Button>
      </div>
    </div>
  );
}
