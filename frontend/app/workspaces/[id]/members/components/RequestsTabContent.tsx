import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkspaceInvitationsQuery } from '@/lib/queries/workspaces';
import { RequestItem } from './RequestItem';

interface RequestsTabContentProps {
  workspaceId: string;
}

export function RequestsTabContent({ workspaceId }: RequestsTabContentProps) {
  const {
    data: invitations,
    isLoading,
    isError,
    error,
  } = useWorkspaceInvitationsQuery(workspaceId, { enabled: true });

  if (isLoading) {
    return (
      <div className='flex-1 flex flex-col mt-0 items-center justify-center'>
        <div className='animate-spin h-6 w-6 border-2 border-trello-blue border-t-transparent rounded-full' />
      </div>
    );
  }

  if (isError) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to load join requests';
    const isPermissionError =
      errorMessage.includes('Only admins') ||
      errorMessage.includes('permission');

    return (
      <div className='flex-1 flex flex-col mt-0'>
        <div className='shrink-0'>
          <h2 className='text-2xl font-bold text-foreground mb-2'>
            Join requests
          </h2>
          <p className='text-sm text-muted-foreground'>
            Manage requests from users who want to join this workspace.
          </p>
        </div>
        <Separator className='shrink-0 my-4 h-px bg-accent' />
        <div className='text-center py-12 text-muted-foreground'>
          {isPermissionError
            ? 'You need admin permissions to view join requests'
            : 'Failed to load join requests'}
        </div>
      </div>
    );
  }

  const requestsCount = invitations?.length ?? 0;

  return (
    <div className='flex-1 flex flex-col mt-0'>
      <div className='shrink-0'>
        <h2 className='text-2xl font-bold text-foreground mb-2'>
          Pending Invitations ({requestsCount})
        </h2>
        <p className='text-sm text-muted-foreground'>
          List of sent invitations awaiting response. Invited users must accept
          their invitations from their invitations page.
        </p>
      </div>

      <Separator className='shrink-0 my-4 h-px bg-accent' />

      <ScrollArea className='flex-1 min-h-0'>
        <div className='space-y-2 pr-4'>
          {requestsCount === 0 ? (
            <div className='text-center py-12 text-muted-foreground'>
              No join requests
            </div>
          ) : (
            invitations?.map((invitation) => (
              <RequestItem key={invitation.id} invitation={invitation} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
