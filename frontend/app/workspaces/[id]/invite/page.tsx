'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '@/components/ui/empty';
import { Building2, LogIn, Loader2 } from 'lucide-react';
import { useCurrentUserQuery } from '@/lib/queries/users';
import {
  getWorkspaceInviteInfo,
  getWorkspace,
  joinWorkspaceByInviteLink,
} from '@/lib/actions/workspaces';
import { toast } from '@/lib/toast';
import { useQueryClient } from '@tanstack/react-query';
import { workspacesQueryKey } from '@/lib/queries/workspaces';

export default function WorkspaceInvitePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const workspaceId = params.id as string;

  const { data: currentUser, isLoading: userLoading } = useCurrentUserQuery();
  const [workspaceInfo, setWorkspaceInfo] = useState<{
    id: string;
    name: string;
    logoUrl?: string;
  } | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [joining, setJoining] = useState(false);

  // Load workspace invite info (public)
  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    setWorkspaceError(null);
    getWorkspaceInviteInfo(workspaceId)
      .then((info) => {
        if (!cancelled) setWorkspaceInfo(info);
      })
      .catch((err) => {
        if (!cancelled) {
          setWorkspaceError(
            err instanceof Error ? err.message : 'Workspace not found',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  // If logged in, check if already a member
  useEffect(() => {
    if (!currentUser || !workspaceId || workspaceError) return;
    let cancelled = false;
    getWorkspace(workspaceId)
      .then(() => {
        if (!cancelled) setIsMember(true);
      })
      .catch(() => {
        if (!cancelled) setIsMember(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser, workspaceId, workspaceError]);

  // Redirect if already member
  useEffect(() => {
    if (isMember === true && workspaceId) {
      router.replace(`/workspaces/${workspaceId}/boards`);
    }
  }, [isMember, workspaceId, router]);

  const handleJoin = async () => {
    if (!workspaceId) return;
    setJoining(true);
    try {
      await joinWorkspaceByInviteLink(workspaceId);
      await queryClient.invalidateQueries({ queryKey: workspacesQueryKey });
      toast.success(`You joined ${workspaceInfo?.name ?? 'the workspace'}`);
      router.push(`/workspaces/${workspaceId}/boards`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to join workspace';
      toast.error(message);
    } finally {
      setJoining(false);
    }
  };

  const loginUrl = `/auth/login?next=${encodeURIComponent(`/workspaces/${workspaceId}/invite`)}`;

  if (workspaceError || !workspaceId) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6'>
        <Empty className='max-w-md'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Building2 className='size-8' />
            </EmptyMedia>
            <EmptyTitle>Workspace not found</EmptyTitle>
            <EmptyDescription>
              This invite link may be invalid or the workspace may have been
              deleted.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant='outline'>
              <Link href='/dashboard'>Go to dashboard</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  if (!workspaceInfo) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Loader2 className='size-5 animate-spin' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!userLoading && !currentUser) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6'>
        <Empty className='max-w-md border border-dashed rounded-lg bg-card p-8'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Building2 className='size-8' />
            </EmptyMedia>
            <EmptyTitle>Join {workspaceInfo.name}</EmptyTitle>
            <EmptyDescription>
              Log in to your account to join this workspace.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href={loginUrl} className='inline-flex items-center gap-2'>
                <LogIn className='size-4' />
                Log in to join
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  // Logged in, checking membership or not a member yet
  if (userLoading || isMember === null) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Loader2 className='size-5 animate-spin' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Logged in, not a member – show Join button
  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <Empty className='max-w-md border border-dashed rounded-lg bg-card p-8'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Building2 className='size-8' />
          </EmptyMedia>
          <EmptyTitle>Join {workspaceInfo.name}</EmptyTitle>
          <EmptyDescription>
            You have been invited to join this workspace. Click below to become
            a member.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={handleJoin} disabled={joining}>
            {joining ? (
              <>
                <Loader2 className='size-4 animate-spin mr-2' />
                Joining...
              </>
            ) : (
              'Join workspace'
            )}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
