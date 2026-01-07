'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

const BOARDS_KEY = 'epitrello_boards';
const WORKSPACES_KEY = 'epitrello_workspaces';

export default function DashboardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [newBoardNameByWorkspace, setNewBoardNameByWorkspace] = useState<Record<string, string>>({});
  const [newBoardDescByWorkspace, setNewBoardDescByWorkspace] = useState<Record<string, string>>({});
  const [newBoardVisibilityByWorkspace, setNewBoardVisibilityByWorkspace] = useState<Record<string, 'personal' | 'workspace' | 'public' | undefined>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; boardId: string | null; boardName: string }>({
    show: false,
    boardId: null,
    boardName: '',
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const createBoard = (workspaceId?: string, name?: string, desc?: string, visibility?: 'personal' | 'workspace' | 'public') => {
    const boardName = (name ?? newBoardName).trim();
    if (!boardName) return;

    const backgrounds = [
      'bg-gradient-to-br from-amber-400 to-orange-500',
      'bg-gradient-to-br from-sky-400 to-blue-500',
      'bg-gradient-to-br from-emerald-400 to-green-500',
      'bg-gradient-to-br from-violet-400 to-purple-500',
      'bg-gradient-to-br from-rose-400 to-pink-500',
      'bg-gradient-to-br from-cyan-400 to-teal-500',
    ];

    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    const newBoard: Board = {
      id: String(Date.now()),
      name: boardName,
      description: (desc ?? newBoardDescription).trim() || undefined,
      background: randomBackground,
      members: 1,
      workspaceId: workspaceId || (workspaces[0] && workspaces[0].id),
      visibility: visibility ?? undefined,
    };
    const next = [newBoard, ...boards];
    setBoards(next);
    try { localStorage.setItem(BOARDS_KEY, JSON.stringify(next)); } catch {}
    setNewBoardName('');
    setNewBoardDescription('');
  };

  // load workspaces and boards from localStorage on mount
  useEffect(() => {
    try {
      const rawWs = localStorage.getItem(WORKSPACES_KEY);
      let ws: Workspace[] = [];
      if (rawWs) {
        ws = JSON.parse(rawWs) as Workspace[];
      }
      if (!ws || ws.length === 0) {
        const defaults: Workspace[] = [
          { id: String(Date.now() - 2000), title: 'Personal' },
          { id: String(Date.now() - 1000), title: 'Acme Corp' },
        ];
        ws = defaults;
        try { localStorage.setItem(WORKSPACES_KEY, JSON.stringify(defaults)); } catch {}
      }
      setWorkspaces(ws);

      const rawBoards = localStorage.getItem(BOARDS_KEY);
      let b: Board[] = [];
      if (rawBoards) {
        b = JSON.parse(rawBoards) as Board[];
      }
      if (!b || b.length === 0) {
        // create some sample boards assigned to first workspace
        const samples: Board[] = [
          { id: 'b1', name: 'Project Alpha', description: 'Main project board', background: 'bg-gradient-to-br from-amber-400 to-orange-500', members: 3, workspaceId: ws[0].id },
          { id: 'b2', name: 'Sprint Q4', description: 'Current sprint tasks', background: 'bg-gradient-to-br from-sky-400 to-blue-500', members: 5, workspaceId: ws[0].id },
          { id: 'b3', name: 'Company Roadmap', description: 'Roadmap items', background: 'bg-gradient-to-br from-emerald-400 to-green-500', members: 2, workspaceId: ws[1].id },
        ];
        b = samples;
        try { localStorage.setItem(BOARDS_KEY, JSON.stringify(samples)); } catch {}
      }
      setBoards(b);
    } catch (e) {
      // ignore
    }
  }, []);

  const deleteBoard = (id: string) => {
    const board = boards.find(b => b.id === id);
    if (board) {
      setDeleteConfirm({
        show: true,
        boardId: id,
        boardName: board.name,
      });
    }
  };

  const confirmDeleteBoard = () => {
    if (deleteConfirm.boardId) {
      const next = boards.filter(board => board.id !== deleteConfirm.boardId);
      setBoards(next);
      try { localStorage.setItem(BOARDS_KEY, JSON.stringify(next)); } catch {}
      setFeedback(`Board "${deleteConfirm.boardName}" has been deleted`);
      setTimeout(() => setFeedback(null), 3000);
    }
    setDeleteConfirm({ show: false, boardId: null, boardName: '' });
  };

  const cancelDeleteBoard = () => {
    setDeleteConfirm({ show: false, boardId: null, boardName: '' });
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
        <div className='flex items-center gap-3'>
          <div className='flex gap-2'>
            <input
              type='text'
              placeholder='Board name'
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            />
            <input
              type='text'
              placeholder='Description (optional)'
              value={newBoardDescription}
              onChange={(e) => setNewBoardDescription(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>
          <button
            onClick={() => createBoard()}
            disabled={!newBoardName.trim()}
            className='inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Create board
          </button>
        </div>
      </header>

      <main>
        <section>
          <h2 className='text-lg font-medium mb-4 text-gray-900'>Workspaces</h2>

          <div className='space-y-6'>
            {workspaces.map((ws) => {
              const wsBoards = boards.filter(b => b.workspaceId === ws.id);
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
                              onClick={() => {
                                createBoard(
                                  ws.id,
                                  newBoardNameByWorkspace[ws.id],
                                  newBoardDescByWorkspace[ws.id],
                                  newBoardVisibilityByWorkspace[ws.id]
                                );
                                // clear inputs and close
                                setNewBoardNameByWorkspace((s) => ({ ...s, [ws.id]: '' }));
                                setNewBoardDescByWorkspace((s) => ({ ...s, [ws.id]: '' }));
                                setNewBoardVisibilityByWorkspace((s) => ({ ...s, [ws.id]: undefined }));
                                setCreatingFor(null);
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
                      {wsBoards.length === 0 ? (
                        <div className='text-gray-500 text-sm'>No boards in this workspace</div>
                      ) : (
                        wsBoards.map((board) => (
                          <div key={board.id} onClick={() => router.push(`/boards/${board.id}`)} className={`min-w-[200px] h-32 rounded-lg overflow-hidden cursor-pointer ${board.background || 'bg-gray-200'}`}>
                            <div className='relative h-full'>
                              <div className='absolute inset-0 bg-black bg-opacity-20' />
                              <div className='absolute inset-0 p-3 text-white flex flex-col justify-between'>
                                <div className='text-sm font-semibold truncate'>{board.name}</div>
                                {board.members ? <div className='text-xs'>{board.members} {board.members === 1 ? 'member' : 'members'}</div> : null}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
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
