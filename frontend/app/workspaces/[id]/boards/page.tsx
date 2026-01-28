'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CreateBoardModal from '@/components/CreateBoardModal';
import { createBoard, Visibility } from '@/lib/actions/boards';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import {
  useWorkspaceQuery,
  useWorkspaceBoardsQuery,
  workspaceBoardsQueryKey,
} from '@/lib/queries/workspaces';

type Board = {
  id: string;
  name: string;
  description?: string;
  background?: string;
  members?: number;
  workspaceId?: string;
};

export default function WorkspaceBoardsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: workspace } = useWorkspaceQuery(workspaceId);
  const {
    data: gqlBoards,
    isLoading: loading,
    error: boardsError,
    refetch,
  } = useWorkspaceBoardsQuery(workspaceId);

  const workspaceName = workspace?.name || 'Workspace';
  const boards: Board[] = (gqlBoards || []).map((b) => ({
    id: b.id,
    name: b.title,
    description: b.description,
    background: b.background,
    members: b.members ? b.members.length : undefined,
    workspaceId: b.workspaceId,
  }));
  const error = boardsError?.message ?? null;

  return (
    <div className='h-full p-4'>
      <div className='max-w-7xl mx-auto h-full flex flex-col'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-semibold text-foreground'>
              {workspaceName}
            </h1>
            <p className='text-sm text-muted-foreground'>
              Boards inside this workspace
            </p>
          </div>
          <div>
            <Button
              onClick={() => router.push(`/workspaces/${workspaceId}/members`)}
              color='primary'
              variant='default'
              className='mr-2'
            >
              Members
            </Button>
            <Button
              onClick={() => router.push(`/workspaces/${workspaceId}/settings`)}
              variant='default'
            >
              Settings
            </Button>
          </div>
        </div>

        <div className='flex-1 overflow-auto'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {loading && (
              <div className='col-span-full flex items-center justify-center py-12'>
                <div className='animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full' />
              </div>
            )}
            {!loading && error && (
              <div className='col-span-full bg-red-50 text-red-700 p-4 rounded'>
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex-1'>
                    <div className='font-semibold'>Erreur backend</div>
                    <div className='mt-1 whitespace-pre-wrap wrap-break-word text-sm'>
                      {error}
                    </div>
                  </div>
                  <Button
                    onClick={() => refetch()}
                    variant='destructive'
                    size='sm'
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
            {!loading && !error && boards.length === 0 && (
              <div className='col-span-full flex flex-col items-center justify-center bg-card border border-accent rounded-lg p-8 text-center'>
                <p className='text-muted-foreground mb-4'>
                  No boards in this workspace.
                </p>
                <Button onClick={() => setShowCreate(true)}>Add a board</Button>
              </div>
            )}
            {!loading &&
              !error &&
              boards.map((b) => {
                const isImageBackground =
                  !!b.background &&
                  (b.background.startsWith('data:image') ||
                    b.background.startsWith('http') ||
                    b.background.startsWith('https'));

                return (
                  <div
                    key={b.id}
                    onClick={() => router.push(`/boards/${b.id}`)}
                    className={`cursor-pointer rounded-lg overflow-hidden h-36 ${
                      !isImageBackground
                        ? b.background || 'bg-primary'
                        : 'bg-primary'
                    }`}
                  >
                    <div className='relative h-full'>
                      {isImageBackground && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.background as string}
                          alt={b.name}
                          className='absolute inset-0 w-full h-full object-contain'
                        />
                      )}
                      <div className='absolute inset-0 p-3 text-white flex flex-col justify-between shadow-lg'>
                        <div className='text-sm font-semibold truncate'>
                          {b.name}
                        </div>
                        {b.members ? (
                          <div className='text-xs opacity-90'>
                            {b.members} {b.members === 1 ? 'member' : 'members'}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      {/* Create Board Modal */}
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
