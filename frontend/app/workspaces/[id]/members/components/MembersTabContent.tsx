import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link as LinkIcon } from 'lucide-react';
import { toast } from '@/lib/toast';
import { MemberItem } from './MemberItem';
import type { WorkspaceMemberWithUser } from '@/lib/actions/workspaces';

interface MembersTabContentProps {
  members: WorkspaceMemberWithUser[];
  memberCount: number;
  memberLimit: number;
  workspaceId: string;
  onRemove: (userId: string) => void;
  removing: string | null;
}

export function MembersTabContent({
  members,
  memberCount,
  memberLimit,
  workspaceId,
  onRemove,
  removing,
}: MembersTabContentProps) {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredMembers = members.filter((m) => {
    if (!filterQuery.trim()) return true;
    const query = filterQuery.toLowerCase();
    return (
      m.user.name.toLowerCase().includes(query) ||
      m.user.email.toLowerCase().includes(query)
    );
  });

  const handleCopyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/workspaces/${workspaceId}/invite`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Invitation link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy invitation link');
    }
  };

  return (
    <div className='flex-1 flex flex-col mt-0'>
      {/* Title and Description - Fixed */}
      <div className='shrink-0'>
        <h2 className='text-2xl font-bold text-foreground mb-2'>
          Workspace members ({memberCount})
        </h2>
        <p className='text-sm text-muted-foreground'>
          Workspace members can view and join all Workspace visible boards and
          create new boards in the Workspace.
        </p>
      </div>

      <Separator className='shrink-0 my-4 h-px bg-accent' />

      {/* Invite Section - Fixed */}
      <div className='space-y-3 shrink-0'>
        <h3 className='text-lg font-semibold text-foreground'>
          Invite members to join you
        </h3>
        <p className='text-sm text-muted-foreground'>
          Share an invite link with your team members. You can disable or create
          a new link at any time. Pending invitations count towards your{' '}
          {memberLimit} collaborator limit.
        </p>
        <div className='flex justify-end'>
          <Button
            variant='outline'
            className='border-border'
            onClick={handleCopyInviteLink}
          >
            <LinkIcon className='h-4 w-4 mr-2' />
            Invite with link
          </Button>
        </div>
      </div>

      <Separator className='shrink-0 my-4 h-px bg-accent' />

      {/* Filter Input - Fixed */}
      <div className='shrink-0 mb-4'>
        <Input
          placeholder='Filter by name'
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className='max-w-md'
        />
      </div>

      {/* Members List - Scrollable */}
      <ScrollArea className='flex-1 min-h-0'>
        <div className='space-y-2 pr-4'>
          {filteredMembers.length === 0 ? (
            <div className='text-center py-12 text-muted-foreground'>
              {filterQuery ? 'No members found' : 'No members'}
            </div>
          ) : (
            filteredMembers.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                onRemove={onRemove}
                isRemoving={removing === member.userId}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
