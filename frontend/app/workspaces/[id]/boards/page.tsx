'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CreateBoardModal from '@/components/CreateBoardModal';
import { getWorkspaceBoards, GqlBoard, getWorkspace } from '@/lib/actions/workspaces';
import { createBoard, Visibility } from '@/lib/actions/boards';

type Board = { id: string; name: string; description?: string; background?: string; members?: number; workspaceId?: string };

export default function WorkspaceBoardsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const [boards, setBoards] = useState<Board[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string>('Workspace');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBoards = async () => {
      setLoading(true);
      setError(null);
      try {
        const gqlBoards: GqlBoard[] = await getWorkspaceBoards(workspaceId);
        const uiBoards: Board[] = (gqlBoards || []).map((b) => ({
          id: b.id,
          name: b.title,
          description: b.description,
          background: b.background,
          members: b.members ? b.members.length : undefined,
          workspaceId: b.workspaceId,
        }));
        setBoards(uiBoards);

        // Fetch workspace name from backend; fallback to localStorage if it fails
        try {
          const ws = await getWorkspace(workspaceId);
          setWorkspaceName(ws.name || 'Workspace');
        } catch (e) {
          try {
            const rawWs = localStorage.getItem('epitrello_workspaces');
            const wsLocal = rawWs ? JSON.parse(rawWs) : [];
            const found = (wsLocal || []).find((w: any) => w.id === workspaceId);
            if (found) setWorkspaceName(found.title || found.name || 'Workspace');
          } catch (_) {}
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Failed to load boards';
        console.error('Failed to load workspace boards', err);
        setError(msg);
        setBoards([]);
      } finally {
        setLoading(false);
      }
    };

    loadBoards();
  }, [workspaceId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{workspaceName} — Boards</h1>
            <p className="text-sm text-gray-500">Boards inside this workspace</p>
          </div>
          <div>
            <button onClick={() => router.push(`/workspaces/${workspaceId}/members`)} className="px-3 py-1 bg-gray-100 rounded mr-2">Members</button>
            <button onClick={() => router.push(`/workspaces/${workspaceId}/settings`)} className="px-3 py-1 bg-gray-100 rounded">Settings</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
          )}
          {!loading && error && (
            <div className="col-span-full bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold">Erreur backend</div>
                  <div className="mt-1 whitespace-pre-wrap break-words text-sm">{error}</div>
                </div>
                <button onClick={() => {
                  setError(null);
                  setLoading(true);
                  // re-trigger load by updating dependency or calling loader directly
                  (async () => {
                    try {
                      const gqlBoards: GqlBoard[] = await getWorkspaceBoards(workspaceId);
                      const uiBoards: Board[] = (gqlBoards || []).map((b) => ({
                        id: b.id,
                        name: b.title,
                        description: b.description,
                        background: b.background,
                        members: b.members ? b.members.length : undefined,
                        workspaceId: b.workspaceId,
                      }));
                      setBoards(uiBoards);
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Failed to load boards';
                      console.error('Failed to load workspace boards (retry)', err);
                      setError(msg);
                      setBoards([]);
                    } finally {
                      setLoading(false);
                    }
                  })();
                }} className="px-3 py-1 bg-red-600 text-white rounded">Réessayer</button>
              </div>
            </div>
          )}
          {!loading && !error && boards.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center bg-white border rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Aucun board dans ce workspace.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Ajouter un board
              </button>
            </div>
          )}
          {!loading && !error && boards.map((b) => (
            <div key={b.id} onClick={() => router.push(`/boards/${b.id}`)} className={`cursor-pointer rounded-lg overflow-hidden h-36 ${b.background || 'bg-gray-200'}`}>
              <div className="relative h-full">
                <div className="absolute inset-0 bg-black bg-opacity-20" />
                <div className="absolute inset-0 p-3 text-white flex flex-col justify-between">
                  <div className="text-sm font-semibold truncate">{b.name}</div>
                  {b.members ? <div className="text-xs">{b.members} {b.members === 1 ? 'member' : 'members'}</div> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Create Board Modal */}
      <CreateBoardModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={async (payload: { name: string; workspaceId?: string; visibility?: string }) => {
          try {
            const visMap: Record<string, Visibility> = {
              personal: 'PRIVATE',
              workspace: 'WORKSPACE',
              public: 'PUBLIC',
            };
            const newBoard = await createBoard({
              title: payload.name,
              visibility: payload.visibility ? visMap[payload.visibility] : undefined,
              workspaceId: payload.workspaceId || workspaceId,
            });
            setShowCreate(false);
            router.push(`/boards/${newBoard.id}`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to create board';
            alert(msg);
          }
        }}
      />
    </div>
  );
}
