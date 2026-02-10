import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link as LinkIcon } from 'lucide-react';
import { toast } from '@/lib/toast';
import { MemberItem } from './MemberItem';
import type {
  WorkspaceMemberWithUser,
  GqlBoard,
} from '@/lib/actions/workspaces';
import type { MemberBoardItem } from './MemberBoardsPopover';
import type { MemberToPromote } from './LeaveWorkspacePopover';

interface MembersTabContentProps {
  members: WorkspaceMemberWithUser[];
  memberCount: number;
  memberLimit: number;
  workspaceId: string;
  /** Called when current user confirms Leave in popover. */
  onLeaveWorkspace?: () => Promise<void>;
  /** Called when admin chooses Remove from Workspace in popover. */
  onRemoveFromWorkspace?: (userId: string) => Promise<void>;
  /** Called when admin chooses Remove from Workspace and Boards in popover. */
  onRemoveFromWorkspaceAndBoards?: (userId: string) => Promise<void>;
  removing: string | null;
  /** If false, invite section and remove buttons are hidden (non-admin). */
  canInvite?: boolean;
  canRemove?: boolean;
  /** If true, workspace admins can change member roles. */
  canUpdateRole?: boolean;
  /** Called when admin changes a member's role. */
  onRoleChange?: (userId: string, role: string) => Promise<void>;
  /** Workspace boards (with members) to show "View boards" per member. */
  workspaceBoards?: GqlBoard[];
  /** Current user id to show "Leave" instead of "Remove" for own row. */
  currentUserId?: string;
  /** When current user is the only admin, members that can be promoted. */
  otherMembersToPromote?: MemberToPromote[];
  /** Called when current user promotes another member to admin (before leaving). */
  onAssignAdmin?: (userId: string) => Promise<void>;
  /** When true, current user is the only admin. */
  isOnlyAdmin?: boolean;
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

export function MembersTabContent({
  members,
  memberCount,
  memberLimit,
  workspaceId,
  onLeaveWorkspace,
  onRemoveFromWorkspace,
  onRemoveFromWorkspaceAndBoards,
  removing,
  canInvite = true,
  canRemove = true,
  canUpdateRole = false,
  onRoleChange,
  workspaceBoards,
  currentUserId,
  otherMembersToPromote,
  onAssignAdmin,
  isOnlyAdmin,
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

      {/* Invite Section - Fixed (admins only) */}
      {canInvite && (
        <>
          <div className='space-y-3 shrink-0'>
            <h3 className='text-lg font-semibold text-foreground'>
              Invite members to join you
            </h3>
            <p className='text-sm text-muted-foreground'>
              Share an invite link with your team members. You can disable or
              create a new link at any time. Pending invitations count towards
              your {memberLimit} collaborator limit.
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
        </>
      )}

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
                onLeaveWorkspace={onLeaveWorkspace}
                otherMembersToPromote={otherMembersToPromote}
                onAssignAdmin={onAssignAdmin}
                onRemoveFromWorkspace={onRemoveFromWorkspace}
                onRemoveFromWorkspaceAndBoards={onRemoveFromWorkspaceAndBoards}
                removing={removing}
                canRemove={canRemove}
                canUpdateRole={canUpdateRole}
                onRoleChange={onRoleChange}
                memberBoards={getBoardsForMember(
                  workspaceBoards,
                  member.userId,
                )}
                isCurrentUser={currentUserId === member.userId}
                isOnlyAdmin={isOnlyAdmin}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
