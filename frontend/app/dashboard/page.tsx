'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyWorkspaces, getWorkspaceBoards, GqlBoard } from '@/lib/actions/workspaces';
import { createBoard as createBoardAction, Visibility } from '@/lib/actions/boards';
import { AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Board = {
  id: string;
  name: string;
  description?: string;
  background?: string; // tailwind bg class
  members?: number;
  workspaceId?: string;
  visibility?: 'personal' | 'workspace' | 'public';
};

type Workspace = { id: string; title: string };

const WORKSPACES_KEY = 'epitrello_workspaces';

export default function DashboardPage() {
  const router = useRouter();
  const [workspaceBoards, setWorkspaceBoards] = useState<Record<string, Board[]>>({});
  const [boardsLoading, setBoardsLoading] = useState<Record<string, boolean>>({});
  const [boardsError, setBoardsError] = useState<Record<string, string | null>>({});
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [, setLoadingWorkspaces] = useState(true);
  const [, setWorkspacesError] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [newBoardNameByWorkspace, setNewBoardNameByWorkspace] = useState<Record<string, string>>({});
  const [newBoardDescByWorkspace, setNewBoardDescByWorkspace] = useState<Record<string, string>>({});
  const [newBoardVisibilityByWorkspace, setNewBoardVisibilityByWorkspace] = useState<Record<string, 'personal' | 'workspace' | 'public' | undefined>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; boardId: string | null; boardName: string; workspaceId: string | null }>({
    show: false,
    boardId: null,
    boardName: '',
    workspaceId: null,
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const createBoard = async (workspaceId?: string, name?: string, desc?: string, visibility?: 'personal' | 'workspace' | 'public') => {
    const boardName = (name ?? newBoardName).trim();
    if (!boardName) return;

    const visMap: Record<'personal' | 'workspace' | 'public', Visibility> = {
      personal: 'PRIVATE',
      workspace: 'WORKSPACE',
      public: 'PUBLIC',
    };

    const newBoard = await createBoardAction({
      title: boardName,
      description: (desc ?? newBoardDescription).trim() || undefined,
      visibility: visibility ? visMap[visibility] : undefined,
      workspaceId: workspaceId || (workspaces[0] && workspaces[0].id),
    });

    const workspaceIdKey = newBoard.workspaceId ?? workspaceId ?? '';
    if (workspaceIdKey) {
      setWorkspaceBoards((prev) => ({
        ...prev,
        [workspaceIdKey]: [
          {
            id: newBoard.id,
            name: newBoard.title,
            description: newBoard.description ?? undefined,
            background: newBoard.background ?? undefined,
            workspaceId: newBoard.workspaceId ?? undefined
          },
          ...(prev[workspaceIdKey] || []),
        ],
      }));
    }

    setNewBoardName('');
    setNewBoardDescription('');
  };

  useEffect(() => {
    const load = async () => {
      setLoadingWorkspaces(true);
      setWorkspacesError(null);
      try {
        const wsFromApi = await getMyWorkspaces();
        const mapped = wsFromApi.map((w) => ({ id: w.id, title: w.name }));
        setWorkspaces(mapped);
        try { localStorage.setItem(WORKSPACES_KEY, JSON.stringify(mapped)); } catch {}
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load workspaces';
        setWorkspacesError(message);
        try {
          const rawWs = localStorage.getItem(WORKSPACES_KEY);
          const ws = rawWs ? JSON.parse(rawWs) as Workspace[] : [];
          setWorkspaces(ws);
        } catch {
          setWorkspaces([]);
        }
      } finally {
        setLoadingWorkspaces(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadBoardsForWs = async (wsId: string) => {
      setBoardsLoading((p) => ({ ...p, [wsId]: true }));
      setBoardsError((p) => ({ ...p, [wsId]: null }));
      try {
        const gqlBoards: GqlBoard[] = await getWorkspaceBoards(wsId);
        const mapped: Board[] = (gqlBoards || []).map((b) => ({
          id: b.id,
          name: b.title,
          description: b.description || undefined,
          background: b.background,
          members: b.members ? b.members.length : undefined,
          workspaceId: b.workspaceId,
        }));
        setWorkspaceBoards((prev) => ({ ...prev, [wsId]: mapped }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Failed to load boards';
        setBoardsError((p) => ({ ...p, [wsId]: msg }));
        setWorkspaceBoards((p) => ({ ...p, [wsId]: [] }));
      } finally {
        setBoardsLoading((p) => ({ ...p, [wsId]: false }));
      }
    };

    if (workspaces.length > 0) {
      workspaces.forEach((ws) => {
        if (!workspaceBoards[ws.id] && !boardsLoading[ws.id]) {
          loadBoardsForWs(ws.id);
        }
      });
    }
  }, [workspaces, workspaceBoards, boardsLoading]);

  const confirmDeleteBoard = () => {
    if (deleteConfirm.boardId && deleteConfirm.workspaceId) {
      setWorkspaceBoards((prev) => {
        const wsId = deleteConfirm.workspaceId || '';
        const nextWsBoards = (prev[wsId] || []).filter((b) => b.id !== deleteConfirm.boardId);
        return { ...prev, [wsId]: nextWsBoards };
      });
      setFeedback(`Board "${deleteConfirm.boardName}" has been deleted`);
      setTimeout(() => setFeedback(null), 3000);
    }
    setDeleteConfirm({ show: false, boardId: null, boardName: '', workspaceId: null });
  };

  const cancelDeleteBoard = () => {
    setDeleteConfirm({ show: false, boardId: null, boardName: '', workspaceId: null });
  };

  return (
    <div className='min-h-screen bg-background p-6 text-trello'>
      <header className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <div className='h-10 w-10 rounded bg-trello-blue flex items-center justify-center text-white font-bold'>
            E
          </div>
          <h1 className='text-2xl font-semibold text-trello'>Epitrello</h1>
        </div>

      </header>

      <main>
        <section>
          <h2 className='text-lg font-medium mb-4 text-trello'>Workspaces</h2>
          <div className='space-y-6'>
            {workspaces.map((ws) => {
              const wsBoards = workspaceBoards[ws.id] || [];
              const wsBoardsLoading = boardsLoading[ws.id];
              const wsBoardsError = boardsError[ws.id];
              return (
                <div key={ws.id} className='p-2'>
                  <div className='flex items-start justify-between gap-4 mb-3'>
                    <div>
                      <h3 className='text-lg font-semibold text-trello'>{ws.title}</h3>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button onClick={() => router.push(`/workspaces/${ws.id}/boards`)} variant="secondary" size="sm">Boards</Button>
                      <Button onClick={() => router.push(`/workspaces/${ws.id}/members`)} variant="secondary" size="sm">Members</Button>
                      <Button onClick={() => router.push(`/workspaces/${ws.id}/settings`)} variant="secondary" size="sm">Settings</Button>
                      <Button onClick={() => setCreatingFor(ws.id)} size="sm">New board</Button>
                    </div>
                  </div>

                  <div className='overflow-x-auto'>
                    <div className='flex gap-4 pb-2'>
                      {creatingFor === ws.id && (
                        <div className='min-w-[280px] p-3 bg-trello-card-bg rounded border border-accent shrink-0'>
                          <Input
                            value={newBoardNameByWorkspace[ws.id] ?? ''}
                            onChange={(e) => setNewBoardNameByWorkspace((s) => ({ ...s, [ws.id]: e.target.value }))}
                            placeholder='Board name'
                            className='w-full mb-2'
                          />
                          <Input
                            value={newBoardDescByWorkspace[ws.id] ?? ''}
                            onChange={(e) => setNewBoardDescByWorkspace((s) => ({ ...s, [ws.id]: e.target.value }))}
                            placeholder='Description (optional)'
                            className='w-full mb-2'
                          />
                          <div className='mb-2'>
                            <Label className='text-xs mb-1'>Visibility</Label>
                            <div className='flex gap-2'>
                              <Button
                                onClick={() => setNewBoardVisibilityByWorkspace((s) => ({ ...s, [ws.id]: 'personal' }))}
                                variant={newBoardVisibilityByWorkspace[ws.id] === 'personal' ? 'default' : 'secondary'}
                                size="sm"
                              >
                                Personal
                              </Button>
                              <Button
                                onClick={() => setNewBoardVisibilityByWorkspace((s) => ({ ...s, [ws.id]: 'workspace' }))}
                                variant={newBoardVisibilityByWorkspace[ws.id] === 'workspace' ? 'default' : 'secondary'}
                                size="sm"
                              >
                                Workspace
                              </Button>
                              <Button
                                onClick={() => setNewBoardVisibilityByWorkspace((s) => ({ ...s, [ws.id]: 'public' }))}
                                variant={newBoardVisibilityByWorkspace[ws.id] === 'public' ? 'default' : 'secondary'}
                                size="sm"
                              >
                                Public
                              </Button>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            <Button
                              onClick={async () => {
                                try {
                                  await createBoard(
                                    ws.id,
                                    newBoardNameByWorkspace[ws.id],
                                    newBoardDescByWorkspace[ws.id],
                                    newBoardVisibilityByWorkspace[ws.id]
                                  );
                                  // refresh boards for this workspace
                                  setBoardsLoading((p) => ({ ...p, [ws.id]: true }));
                                  try {
                                    const gqlBoards: GqlBoard[] = await getWorkspaceBoards(ws.id);
                                    const mapped: Board[] = (gqlBoards || []).map((b) => ({
                                      id: b.id,
                                      name: b.title,
                                      description: b.description || undefined,
                                      background: b.background,
                                      members: b.members ? b.members.length : undefined,
                                      workspaceId: b.workspaceId,
                                    }));
                                    setWorkspaceBoards((prev) => ({ ...prev, [ws.id]: mapped }));
                                  } finally {
                                    setBoardsLoading((p) => ({ ...p, [ws.id]: false }));
                                  }
                                  // clear inputs and close
                                  setNewBoardNameByWorkspace((s) => ({ ...s, [ws.id]: '' }));
                                  setNewBoardDescByWorkspace((s) => ({ ...s, [ws.id]: '' }));
                                  setNewBoardVisibilityByWorkspace((s) => ({ ...s, [ws.id]: undefined }));
                                  setCreatingFor(null);
                                } catch (err) {
                                  const msg = err instanceof Error ? err.message : 'Failed to create board';
                                  setFeedback(msg);
                                  setTimeout(() => setFeedback(null), 3000);
                                }
                              }}
                              size="sm"
                            >
                              Create
                            </Button>
                            <Button
                              onClick={() => {
                                setCreatingFor(null);
                                setNewBoardNameByWorkspace((s) => ({ ...s, [ws.id]: '' }));
                                setNewBoardDescByWorkspace((s) => ({ ...s, [ws.id]: '' }));
                                setNewBoardVisibilityByWorkspace((s) => ({ ...s, [ws.id]: undefined }));
                              }}
                              variant="secondary"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      {wsBoardsLoading && (
                        <div className='text-trello-secondary text-sm flex items-center gap-2'>
                          <span className='h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin' />
                          Loading boards...
                        </div>
                      )}
                      {!wsBoardsLoading && wsBoardsError && (
                        <div className='text-sm text-red-600 bg-red-50 border border-accent rounded px-3 py-2 flex items-center gap-3'>
                          <span className='font-semibold'>Backend error:</span>
                          <span className='whitespace-pre-wrap wrap-break-word'>{wsBoardsError}</span>
                          <Button
                            onClick={async () => {
                              setBoardsError((p) => ({ ...p, [ws.id]: null }));
                              setBoardsLoading((p) => ({ ...p, [ws.id]: true }));
                              try {
                                const gqlBoards: GqlBoard[] = await getWorkspaceBoards(ws.id);
                                const mapped: Board[] = (gqlBoards || []).map((b) => ({
                                  id: b.id,
                                  name: b.title,
                                  description: b.description || undefined,
                                  background: b.background,
                                  members: b.members ? b.members.length : undefined,
                                  workspaceId: b.workspaceId,
                                }));
                                setWorkspaceBoards((prev) => ({ ...prev, [ws.id]: mapped }));
                              } catch (err) {
                                const msg = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Failed to load boards';
                                setBoardsError((p) => ({ ...p, [ws.id]: msg }));
                              } finally {
                                setBoardsLoading((p) => ({ ...p, [ws.id]: false }));
                              }
                            }}
                            variant="destructive"
                            size="sm"
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                      {!wsBoardsLoading && !wsBoardsError && wsBoards.length === 0 && (
                        <div className='text-trello-secondary text-sm'>No boards in this workspace</div>
                      )}
                      {!wsBoardsLoading && !wsBoardsError && wsBoards.length > 0 && wsBoards.map((board) => (
                        <div key={board.id} onClick={() => router.push(`/boards/${board.id}`)} className={`min-w-[300px] h-36 rounded-lg overflow-hidden cursor-pointer ${board.background || 'bg-primary'}`}>
                          <div className='relative h-full'>
                            <div className='absolute inset-0 shadow-lg' />
                            <div className='absolute inset-0 p-3 text-white flex flex-col justify-between'>
                              <div className='text-sm font-semibold truncate'>{board.name}</div>
                              {board.members ? <div className='text-xs opacity-90'>{board.members} {board.members === 1 ? 'member' : 'members'}</div> : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {feedback && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {feedback}
        </div>
      )}

      <Dialog open={deleteConfirm.show} onOpenChange={(open) => !open && cancelDeleteBoard()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <DialogTitle>Delete Board</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-trello">&quot;{deleteConfirm.boardName}&quot;</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={cancelDeleteBoard}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteBoard}
              variant="destructive"
            >
              Delete Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
