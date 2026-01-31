'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CreateBoardModal from '@/components/CreateBoardModal';
import { createBoard, Visibility } from '@/lib/actions/boards';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '@/components/ui/empty';
import { LayoutGrid, Star, User, Pencil, Lock, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useWorkspaceQuery,
  useWorkspaceBoardsQuery,
  workspaceBoardsQueryKey,
} from '@/lib/queries/workspaces';
import { useWorkspaceRole } from '@/lib/hooks/use-workspace-role';
import { useCurrentUserQuery } from '@/lib/queries/users';

const STARRED_STORAGE_KEY = 'epitrello-starred-board-ids';
const MAX_BOARDS_REMAINING = 10;

type Board = {
  id: string;
  name: string;
  description?: string;
  background?: string;
  members?: { userId: string }[];
  workspaceId?: string;
};

function getStarredBoardIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STARRED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

function setStarredBoardIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify(ids));
}

function getWorkspaceInitials(name: string) {
  return name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getVisibilityText(vis: string) {
  switch (vis) {
    case 'PRIVATE':
      return 'Private';
    case 'PUBLIC':
      return 'Public';
    case 'WORKSPACE':
      return 'Workspace';
    default:
      return vis;
  }
}

function BoardCard({
  board,
  isStarred,
  onStarToggle,
  onClick,
}: {
  board: Board;
  isStarred: boolean;
  onStarToggle: (e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const isImageBackground =
    !!board.background &&
    (board.background.startsWith('data:image') ||
      board.background.startsWith('http') ||
      board.background.startsWith('https'));
  const membersCount = board.members?.length ?? 0;

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      className={`relative cursor-pointer rounded-xl overflow-hidden h-[120px] shrink-0 w-[200px] transition-opacity hover:opacity-95 ${
        !isImageBackground ? board.background || 'bg-primary' : 'bg-primary'
      }`}
    >
      {isImageBackground && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={board.background as string}
          alt={board.name}
          className='absolute inset-0 w-full h-full object-cover'
        />
      )}
      <div className='absolute inset-0 p-3 flex flex-col justify-between text-white'>
        <div className='flex justify-end'>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onStarToggle(e);
            }}
            className={`p-1.5 rounded-full transition-colors ${
              isStarred
                ? 'bg-white/30 text-white'
                : 'bg-white/20 hover:bg-white/30 text-white/80'
            }`}
            aria-label={isStarred ? 'Unstar board' : 'Star board'}
          >
            <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div>
          <div className='font-semibold text-sm truncate'>{board.name}</div>
          {membersCount > 0 && (
            <div className='text-xs opacity-90'>
              {membersCount} {membersCount === 1 ? 'member' : 'members'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateBoardCard({
  remaining,
  onClick,
}: {
  remaining: number;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='shrink-0 w-[200px] h-[120px] rounded-xl bg-muted/80 hover:bg-muted border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors'
    >
      <Plus className='w-6 h-6' />
      <span className='text-sm font-medium'>Create new board</span>
      <span className='text-xs'>{remaining} remaining</span>
    </button>
  );
}

export default function WorkspaceBoardsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [starredIds, setStarredIds] = useState<string[]>(() =>
    getStarredBoardIds()
  );

  const { data: workspace } = useWorkspaceQuery(workspaceId);
  const { permissions } = useWorkspaceRole(workspaceId);
  const { data: currentUser } = useCurrentUserQuery();
  const {
    data: gqlBoards,
    isLoading: loading,
    error: boardsError,
    refetch,
  } = useWorkspaceBoardsQuery(workspaceId);

  const boards: Board[] = useMemo(
    () =>
      (gqlBoards || []).map((b) => ({
        id: b.id,
        name: b.title,
        description: b.description,
        background: b.background,
        members: b.members,
        workspaceId: b.workspaceId,
      })),
    [gqlBoards]
  );

  const toggleStar = useCallback((boardId: string) => {
    setStarredIds((prev) => {
      const next = prev.includes(boardId)
        ? prev.filter((id) => id !== boardId)
        : [...prev, boardId];
      setStarredBoardIds(next);
      return next;
    });
  }, []);

  const starredBoards = useMemo(
    () => boards.filter((b) => starredIds.includes(b.id)),
    [boards, starredIds]
  );
  const currentUserId = currentUser?.id;
  const yourBoards = useMemo(
    () =>
      currentUserId
        ? boards.filter((b) =>
            b.members?.some((m) => m.userId === currentUserId)
          )
        : [],
    [boards, currentUserId]
  );
  const remaining = Math.max(0, MAX_BOARDS_REMAINING - boards.length);

  const workspaceName = workspace?.name || 'Workspace';
  const error = boardsError?.message ?? null;

  const navigateToBoard = (boardId: string) =>
    router.push(`/boards/${boardId}`);

  return (
    <div className='h-full bg-background flex flex-col p-4'>
      <div className='p-6 mx-auto w-full flex flex-col flex-1 min-h-0'>
        {/* Workspace header */}
        <div className='flex items-start gap-3 mb-4'>
          <Avatar className='h-16 w-16 rounded-xl shrink-0'>
            <AvatarImage
              src={workspace?.logoUrl ?? undefined}
              alt={workspaceName}
            />
            <AvatarFallback className='rounded-xl text-xl font-semibold bg-primary text-primary-foreground'>
              {getWorkspaceInitials(workspaceName)}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <h1 className='text-xl font-semibold text-foreground truncate'>
                {workspaceName}
              </h1>
              {permissions.canManageWorkspace && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 shrink-0'
                  onClick={() =>
                    router.push(`/workspaces/${workspaceId}/settings`)
                  }
                  aria-label='Edit workspace'
                >
                  <Pencil className='h-4 w-4' />
                </Button>
              )}
            </div>
            <div className='flex items-center gap-2 text-sm text-muted-foreground mt-0.5'>
              <Lock className='h-4 w-4 shrink-0' />
              <span>
                {workspace ? getVisibilityText(workspace.visibility) : '—'}
              </span>
            </div>
            {workspace?.description && (
              <p className='text-sm text-foreground mt-1'>
                {workspace.description}
              </p>
            )}
          </div>
          <div className='flex gap-2 shrink-0'>
            <Button
              onClick={() => router.push(`/workspaces/${workspaceId}/members`)}
              variant='default'
              size='sm'
            >
              Members
            </Button>
            {permissions.canManageWorkspace && (
              <Button
                onClick={() =>
                  router.push(`/workspaces/${workspaceId}/settings`)
                }
                variant='outline'
                size='sm'
              >
                Settings
              </Button>
            )}
          </div>
        </div>

        <Separator className='mb-4 bg-accent' />

        <div className='flex-1 overflow-y-auto scrollbar-hidden space-y-4'>
          {loading && (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full' />
            </div>
          )}

          {!loading && error && (
            <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center justify-between gap-4'>
              <div className='flex-1'>
                <div className='font-semibold text-destructive'>Erreur</div>
                <div className='mt-1 text-sm text-muted-foreground whitespace-pre-wrap'>
                  {error}
                </div>
              </div>
              <Button onClick={() => refetch()} variant='destructive' size='sm'>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Starred boards */}
              <section>
                <h2 className='flex items-center gap-2 text-sm font-semibold text-foreground mb-2'>
                  <Star className='w-4 h-4' />
                  Starred boards
                </h2>
                {starredBoards.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    No starred boards.
                  </p>
                ) : (
                  <div className='flex flex-wrap gap-3'>
                    {starredBoards.map((b) => (
                      <BoardCard
                        key={b.id}
                        board={b}
                        isStarred
                        onStarToggle={() => toggleStar(b.id)}
                        onClick={() => navigateToBoard(b.id)}
                      />
                    ))}
                  </div>
                )}
              </section>

              <Separator className='bg-accent' />

              {/* Your boards */}
              <section>
                <h2 className='flex items-center gap-2 text-sm font-semibold text-foreground mb-2'>
                  <User className='w-4 h-4' />
                  Your boards
                </h2>
                <div className='flex flex-wrap gap-3'>
                  {yourBoards.map((b) => (
                    <BoardCard
                      key={b.id}
                      board={b}
                      isStarred={starredIds.includes(b.id)}
                      onStarToggle={() => toggleStar(b.id)}
                      onClick={() => navigateToBoard(b.id)}
                    />
                  ))}
                  <CreateBoardCard
                    remaining={remaining}
                    onClick={() => setShowCreate(true)}
                  />
                </div>
              </section>

              <Separator className='bg-accent' />

              {/* All boards in this Workspace */}
              <section>
                <h2 className='flex items-center gap-2 text-sm font-semibold text-foreground mb-2'>
                  <User className='w-4 h-4' />
                  All boards in this Workspace
                </h2>
                {boards.length === 0 ? (
                  <Empty className='bg-card border border-accent rounded-xl py-8'>
                    <EmptyHeader>
                      <EmptyMedia variant='icon'>
                        <LayoutGrid className='size-6' />
                      </EmptyMedia>
                      <EmptyTitle>No boards in this workspace</EmptyTitle>
                      <EmptyDescription>
                        Create a board to get started
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button onClick={() => setShowCreate(true)}>
                        Add a board
                      </Button>
                    </EmptyContent>
                  </Empty>
                ) : (
                  <div className='flex flex-wrap gap-3'>
                    {boards.map((b) => (
                      <BoardCard
                        key={b.id}
                        board={b}
                        isStarred={starredIds.includes(b.id)}
                        onStarToggle={() => toggleStar(b.id)}
                        onClick={() => navigateToBoard(b.id)}
                      />
                    ))}
                    <CreateBoardCard
                      remaining={remaining}
                      onClick={() => setShowCreate(true)}
                    />
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      <CreateBoardModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={async (payload: {
          name: string;
          workspaceId?: string;
          visibility?: string;
          background?: string;
        }) => {
          try {
            const visMap: Record<string, Visibility> = {
              personal: 'PRIVATE',
              workspace: 'WORKSPACE',
              public: 'PUBLIC',
            };
            const newBoard = await createBoard({
              title: payload.name,
              visibility: payload.visibility
                ? visMap[payload.visibility]
                : undefined,
              workspaceId: payload.workspaceId || workspaceId,
              background: payload.background,
            });
            await queryClient.invalidateQueries({
              queryKey: workspaceBoardsQueryKey(workspaceId),
            });
            setShowCreate(false);
            router.push(`/boards/${newBoard.id}`);
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : 'Failed to create board';
            toast.error(msg);
          }
        }}
      />
    </div>
  );
}
