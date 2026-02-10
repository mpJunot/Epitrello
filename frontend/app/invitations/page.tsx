'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Check, X, Mail } from 'lucide-react';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import { acceptInvitation, rejectInvitation } from '@/lib/actions/workspaces';
import {
  useMyInvitationsQuery,
  myInvitationsQueryKey,
} from '@/lib/queries/workspaces';
import { useCurrentUserQuery } from '@/lib/queries/users';
import { toast } from '@/lib/toast';
import type { WorkspaceInvitation } from '@/lib/graphql-types';
import { useMyInvitationsSubscription } from '@/lib/hooks/use-my-invitations-subscription';

export default function InvitationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState<string | null>(null);

  const { data: currentUser } = useCurrentUserQuery();
  const { data: invitations, isLoading, isError } = useMyInvitationsQuery();

  useMyInvitationsSubscription(queryClient, currentUser?.id ?? null, true);

  const handleAccept = async (invitation: WorkspaceInvitation) => {
    setProcessing(invitation.id);
    try {
      await acceptInvitation(invitation.id);
      await queryClient.invalidateQueries({
        queryKey: myInvitationsQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });
      toast.success(
        `Invitation accepted for ${invitation.workspaceName || 'the workspace'}`,
      );

      // Redirect to the workspace if workspaceId is available
      if (invitation.workspaceId) {
        setTimeout(() => {
          router.push(`/workspaces/${invitation.workspaceId}/boards`);
        }, 1000);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to accept invitation';
      toast.error(message);
      console.error('Failed to accept invitation', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    setProcessing(invitationId);
    try {
      await rejectInvitation(invitationId);
      await queryClient.invalidateQueries({
        queryKey: myInvitationsQueryKey,
      });
      toast.success('Invitation rejected');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to reject invitation';
      toast.error(message);
      console.error('Failed to reject invitation', error);
    } finally {
      setProcessing(null);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.split('@')[0].slice(0, 2).toUpperCase();
    }
    return '??';
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className='h-full bg-background flex flex-col p-8 md:p-12'>
        <div className='w-full max-w-5xl flex items-center justify-center flex-1'>
          <div className='animate-spin h-6 w-6 border-2 border-trello-blue border-t-transparent rounded-full' />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='h-full bg-background flex flex-col p-8 md:p-12'>
        <div className='w-full max-w-5xl flex items-center justify-center flex-1'>
          <p className='text-muted-foreground'>Error loading invitations</p>
        </div>
      </div>
    );
  }

  const invitationsList = invitations ?? [];

  return (
    <div className='flex h-full w-full flex-col p-8 md:p-12 bg-background'>
      <div className='flex min-h-0 flex-1 flex-col gap-6 w-full max-w-5xl'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold text-foreground'>
            My Invitations
          </h1>
          <p className='text-sm text-muted-foreground'>
            Manage your invitations to join workspaces
          </p>
        </div>

        <Separator className='h-px bg-accent' />

        {invitationsList.length === 0 ? (
          <Empty className='py-8'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Mail className='size-6' />
              </EmptyMedia>
              <EmptyTitle>No pending invitations</EmptyTitle>
              <EmptyDescription>
                When someone invites you to a workspace, it will appear here
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className='space-y-3'>
            {invitationsList.map((invitation) => (
                <Item
                  key={invitation.id}
                  variant='outline'
                  className='border-accent hover:bg-accent/50'
                >
                  <ItemMedia>
                    <div className='size-12 rounded-full bg-muted flex items-center justify-center text-sm font-medium'>
                      {getInitials(
                        invitation.workspaceName ?? '',
                        invitation.inviteeEmail,
                      )}
                    </div>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      {invitation.workspaceName || 'Unnamed workspace'}
                    </ItemTitle>
                    <ItemDescription>
                      <span className='flex items-center gap-2 flex-wrap'>
                        <span>
                          Invited by{' '}
                          <strong>{invitation.inviterName || 'Unknown'}</strong>
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          • Expires on {formatDate(invitation.expiresAt)}
                        </span>
                      </span>
                    </ItemDescription>
                    <ItemDescription className='text-xs mt-1'>
                      Role:{' '}
                      <span className='font-medium'>{invitation.role}</span>
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleAccept(invitation)}
                      disabled={processing === invitation.id}
                      className='border-green-600 text-green-600 hover:bg-green-50'
                    >
                      <Check className='h-4 w-4 mr-1' />
                      Accept
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleReject(invitation.id)}
                      disabled={processing === invitation.id}
                      className='border-red-600 text-red-600 hover:bg-red-50'
                    >
                      <X className='h-4 w-4 mr-1' />
                      Reject
                    </Button>
                  </ItemActions>
                </Item>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
