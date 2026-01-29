'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  inviteMember,
  removeMember,
  leaveWorkspace,
} from '@/lib/actions/workspaces';
import {
  useWorkspaceMembersQuery,
  useWorkspaceBoardsQuery,
  useWorkspaceInvitationsQuery,
  workspaceMembersQueryKey,
  workspaceInvitationsQueryKey,
} from '@/lib/queries/workspaces';
import { useWorkspaceRole } from '@/lib/hooks/use-workspace-role';
import { useCurrentUserQuery } from '@/lib/queries/users';
import { toast } from '@/lib/toast';
import { MembersHeader } from './components/MembersHeader';
import { MembersSidebar } from './components/MembersSidebar';
import { MembersTabContent } from './components/MembersTabContent';
import { GuestsTabContent } from './components/GuestsTabContent';
import { RequestsTabContent } from './components/RequestsTabContent';
import { InviteMemberDialog } from './components/InviteMemberDialog';
import type { TabType } from './components/types';
import type { WorkspaceMemberWithUser } from '@/lib/actions/workspaces';

export default function WorkspaceMembersPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const { permissions, isAdmin } = useWorkspaceRole(workspaceId);
  const { data: currentUser } = useCurrentUserQuery();

  const {
    data: wsMembers,
    isLoading: loading,
    isError,
    error: membersError,
  } = useWorkspaceMembersQuery(workspaceId);

  const members: WorkspaceMemberWithUser[] = useMemo(
    () => wsMembers ?? [],
    [wsMembers],
  );

  const { data: workspaceBoards } = useWorkspaceBoardsQuery(workspaceId);

  const { data: invitations } = useWorkspaceInvitationsQuery(workspaceId, {
    enabled: permissions.canViewPendingInvitations,
  });

  const memberCount = members.length;
  const memberLimit = 10; // TODO: Get from workspace settings
  const requestsCount = permissions.canViewPendingInvitations
    ? (invitations?.length ?? 0)
    : 0;
  const guestsCount = members.filter((m) => m.role === 'GUEST').length;

  useEffect(() => {
    if (isError && membersError) {
      toast.error(
        membersError instanceof Error
          ? membersError.message
          : 'Failed to load members',
      );
    }
  }, [isError, membersError]);

  // Redirect to members tab if user is not admin and tries to access requests tab
  useEffect(() => {
    if (!isAdmin && activeTab === 'requests') {
      setActiveTab('members');
    }
  }, [isAdmin, activeTab]);

  const handleRemoveOrLeave = async (userId: string) => {
    const isCurrentUser = currentUser?.id === userId;
    const message = isCurrentUser
      ? 'Leave this workspace?'
      : 'Are you sure you want to remove this member?';
    if (!confirm(message)) return;

    setRemoving(userId);
    try {
      if (isCurrentUser) {
        await leaveWorkspace(workspaceId);
        await queryClient.invalidateQueries({
          queryKey: workspaceMembersQueryKey(workspaceId),
        });
        await queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        toast.success('You left the workspace');
        router.push('/dashboard');
      } else {
        await removeMember(workspaceId, userId);
        await queryClient.invalidateQueries({
          queryKey: workspaceMembersQueryKey(workspaceId),
        });
        toast.success('Member removed');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to remove member';
      toast.error(message);
      console.error('Failed to remove member', error);
    } finally {
      setRemoving(null);
    }
  };

  const handleInvite = async (email: string) => {
    await inviteMember(workspaceId, email);
    await queryClient.invalidateQueries({
      queryKey: workspaceMembersQueryKey(workspaceId),
    });
    await queryClient.invalidateQueries({
      queryKey: workspaceInvitationsQueryKey(workspaceId),
    });
    toast.success('Invitation sent');
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='animate-spin h-6 w-6 border-2 border-trello-blue border-t-transparent rounded-full' />
      </div>
    );
  }

  return (
    <div className='h-full bg-background flex flex-col p-4'>
      <MembersHeader
        memberCount={memberCount}
        memberLimit={memberLimit}
        onInviteClick={() => setShowInviteDialog(true)}
        canInvite={permissions.canInviteMembers}
      />

      {/* Tabs Container */}
      <div className='flex-1 overflow-hidden flex'>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          orientation='vertical'
          className='flex-1 flex'
        >
          <MembersSidebar
            memberCount={memberCount}
            guestsCount={guestsCount}
            requestsCount={requestsCount}
            isAdmin={isAdmin}
          />

          {/* Main Content */}
          <div className='flex-1 overflow-hidden flex flex-col'>
            <div className='p-6 flex flex-col h-full flex-1'>
              <TabsContent value='members'>
                <MembersTabContent
                  members={members}
                  memberCount={memberCount}
                  memberLimit={memberLimit}
                  workspaceId={workspaceId}
                  onRemove={handleRemoveOrLeave}
                  removing={removing}
                  canInvite={permissions.canInviteMembers}
                  canRemove={permissions.canRemoveMembers}
                  workspaceBoards={workspaceBoards}
                  currentUserId={currentUser?.id}
                />
              </TabsContent>

              <TabsContent value='guests'>
                <GuestsTabContent
                  members={members}
                  onRemove={handleRemoveOrLeave}
                  removing={removing}
                  canRemove={permissions.canRemoveMembers}
                  workspaceBoards={workspaceBoards}
                  currentUserId={currentUser?.id}
                />
              </TabsContent>

              {isAdmin && (
                <TabsContent value='requests'>
                  <RequestsTabContent workspaceId={workspaceId} />
                </TabsContent>
              )}
            </div>
          </div>
        </Tabs>
      </div>

      {permissions.canInviteMembers && (
        <InviteMemberDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          onInvite={handleInvite}
        />
      )}
    </div>
  );
}
