'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyWorkspaces, getWorkspaceBoards, GqlBoard } from '@/lib/actions/workspaces';
import { createBoard as createBoardAction, Visibility } from '@/lib/actions/boards';

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
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [workspacesError, setWorkspacesError] = useState<string | null>(null);
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

    setWorkspaceBoards((prev) => ({
      ...prev,
      [newBoard.workspaceId || (workspaceId as string)]: [
        { id: newBoard.id, name: newBoard.title, description: newBoard.description, background: newBoard.background, workspaceId: newBoard.workspaceId },
        ...(prev[newBoard.workspaceId || (workspaceId as string)] || []),
      ],
    }));

    setNewBoardName('');
    setNewBoardDescription('');
  };

  // load workspaces from backend (with localStorage fallback)
  useEffect(() => {
    const load = async () => {
      let wsSnapshot: Workspace[] = [];
      setLoadingWorkspaces(true);
      setWorkspacesError(null);
      try {
        // Fetch workspaces from backend
        const wsFromApi = await getMyWorkspaces();
        const mapped = wsFromApi.map((w) => ({ id: w.id, title: w.name }));
        wsSnapshot = mapped;
        setWorkspaces(mapped);
        try { localStorage.setItem(WORKSPACES_KEY, JSON.stringify(mapped)); } catch {}
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load workspaces';
        setWorkspacesError(message);
        // Fallback to localStorage if available
        try {
          const rawWs = localStorage.getItem(WORKSPACES_KEY);
          const ws = rawWs ? JSON.parse(rawWs) as Workspace[] : [];
          wsSnapshot = ws;
          setWorkspaces(ws);
        } catch (e) {
          wsSnapshot = [];
          setWorkspaces([]);
        }
      } finally {
        setLoadingWorkspaces(false);
      }
    };

    load();
  }, []);

  // Fetch boards for each workspace from backend
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

  const deleteBoard = (id: string) => {
    let foundWorkspace: string | null = null;
    let foundName = '';
    for (const [wsId, list] of Object.entries(workspaceBoards)) {
      const b = list.find((x) => x.id === id);
      if (b) {
        foundWorkspace = wsId;
        foundName = b.name;
        break;
      }
    }
    if (foundWorkspace) {
      setDeleteConfirm({ show: true, boardId: id, boardName: foundName, workspaceId: foundWorkspace });
    }
  };

  const confirmDeleteBoard = () => {
    if (deleteConfirm.boardId && deleteConfirm.workspaceId) {
      setWorkspaceBoards((prev) => {
        const wsId = deleteConfirm.workspaceId || '';
        const nextWsBoards = (prev[wsId] || []).filter((b) => b.id !== deleteConfirm.boardId);
        return { ...prev, [wsId]: nextWsBoards };
      });
      setFeedback(`Board "${deleteConfirm.boardName}" has been deleted (frontend only)`);
      setTimeout(() => setFeedback(null), 3000);
    }
    setDeleteConfirm({ show: false, boardId: null, boardName: '', workspaceId: null });
  };

  const cancelDeleteBoard = () => {
    setDeleteConfirm({ show: false, boardId: null, boardName: '', workspaceId: null });
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6 text-gray-900'>
      <header className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <div className='h-10 w-10 rounded bg-indigo-600 flex items-center justify-center text-white font-bold'>
            E
          </div>
          <h1 className='text-2xl font-semibold text-gray-900'>Epitrello — Boards</h1>
        </div>
        
      </header>

      <main>
        <section>
          <h2 className='text-lg font-medium mb-4 text-gray-900'>Workspaces</h2>

          <div className='space-y-6'>
            {workspaces.map((ws) => {
              const wsBoards = workspaceBoards[ws.id] || [];
              const wsBoardsLoading = boardsLoading[ws.id];
              const wsBoardsError = boardsError[ws.id];
              return (
                <div key={ws.id} className='bg-white rounded-lg shadow-sm p-4'>
                  <div className='flex items-start justify-between gap-4 mb-3'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900'>{ws.title}</h3>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button onClick={() => router.push(`/workspaces/${ws.id}/boards`)} className='text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200'>Boards</button>
                      <button onClick={() => router.push(`/workspaces/${ws.id}/members`)} className='text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200'>Members</button>
                      <button onClick={() => router.push(`/workspaces/${ws.id}/settings`)} className='text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200'>Settings</button>
                      <button onClick={() => setCreatingFor(ws.id)} className='text-sm px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700'>New board</button>
                    </div>
                  </div>

                  <div className='overflow-x-auto'>
                    <div className='flex gap-4 pb-2'>
                      {creatingFor === ws.id && (
                        <div className='min-w-[280px] p-3 bg-white rounded border flex-shrink-0'>
                          <input
                            value={newBoardNameByWorkspace[ws.id] ?? ''}
                            onChange={(e) => setNewBoardNameByWorkspace((s) => ({ ...s, [ws.id]: e.target.value }))}
                            placeholder='Board name'
                            className='w-full mb-2 px-2 py-1 border rounded text-sm'
                          />
                          <input
                            value={newBoardDescByWorkspace[ws.id] ?? ''}
                            onChange={(e) => setNewBoardDescByWorkspace((s) => ({ ...s, [ws.id]: e.target.value }))}
                            placeholder='Description (optional)'
                            className='w-full mb-2 px-2 py-1 border rounded text-sm'
                          />
                          <div className='mb-2'>
                            <div className='text-xs text-gray-600 mb-1'>Visibility</div>
                            <div className='flex gap-2'>
                              <button
                                onClick={() => setNewBoardVisibilityByWorkspace((s) => ({ ...s, [ws.id]: 'personal' }))}
                                className={`px-3 py-1 rounded text-sm ${newBoardVisibilityByWorkspace[ws.id] === 'personal' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
                                Personal
                              </button>
                              <button
                                onClick={() => setNewBoardVisibilityByWorkspace((s) => ({ ...s, [ws.id]: 'workspace' }))}
                                className={`px-3 py-1 rounded text-sm ${newBoardVisibilityByWorkspace[ws.id] === 'workspace' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
                                Workspace
                              </button>
                              <button
                                onClick={() => setNewBoardVisibilityByWorkspace((s) => ({ ...s, [ws.id]: 'public' }))}
                                className={`px-3 py-1 rounded text-sm ${newBoardVisibilityByWorkspace[ws.id] === 'public' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
                                Public
                              </button>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            <button
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
                              className='px-3 py-1 bg-indigo-600 text-white rounded text-sm'
                            >
                              Create
                            </button>
                            <button
                              onClick={() => {
                                setCreatingFor(null);
                                setNewBoardNameByWorkspace((s) => ({ ...s, [ws.id]: '' }));
                                setNewBoardDescByWorkspace((s) => ({ ...s, [ws.id]: '' }));
                                setNewBoardVisibilityByWorkspace((s) => ({ ...s, [ws.id]: undefined }));
                              }}
                              className='px-3 py-1 bg-gray-100 rounded text-sm'
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      {wsBoardsLoading && (
                        <div className='text-gray-500 text-sm flex items-center gap-2'>
                          <span className='h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin' />
                          Chargement des boards...
                        </div>
                      )}
                      {!wsBoardsLoading && wsBoardsError && (
                        <div className='text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center gap-3'>
                          <span className='font-semibold'>Erreur backend :</span>
                          <span className='whitespace-pre-wrap break-words'>{wsBoardsError}</span>
                          <button
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
                            className='px-2 py-1 bg-red-600 text-white rounded text-xs'
                          >
                            Réessayer
                          </button>
                        </div>
                      )}
                      {!wsBoardsLoading && !wsBoardsError && wsBoards.length === 0 && (
                        <div className='text-gray-500 text-sm'>No boards in this workspace</div>
                      )}
                      {!wsBoardsLoading && !wsBoardsError && wsBoards.length > 0 && wsBoards.map((board) => (
                        <div key={board.id} onClick={() => router.push(`/boards/${board.id}`)} className={`min-w-[200px] h-32 rounded-lg overflow-hidden cursor-pointer ${board.background || 'bg-gray-200'}`}>
                          <div className='relative h-full'>
                            <div className='absolute inset-0 bg-black bg-opacity-20' />
                            <div className='absolute inset-0 p-3 text-white flex flex-col justify-between'>
                              <div className='text-sm font-semibold truncate'>{board.name}</div>
                              {board.members ? <div className='text-xs'>{board.members} {board.members === 1 ? 'member' : 'members'}</div> : null}
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

      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {feedback}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Board</h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <span className="font-semibold text-gray-900">&quot;{deleteConfirm.boardName}&quot;</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeleteBoard}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBoard}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Delete Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
