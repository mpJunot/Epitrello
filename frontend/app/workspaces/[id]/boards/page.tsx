'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Board = { id: string; name: string; description?: string; background?: string; members?: number; workspaceId?: string };

export default function WorkspaceBoardsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const [boards, setBoards] = useState<Board[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string>('Workspace');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('epitrello_boards');
      const arr = raw ? JSON.parse(raw) as Board[] : [];
      const filtered = arr.filter(b => b.workspaceId === workspaceId);
      setBoards(filtered);
    } catch (e) { setBoards([]); }

    try {
      const rawWs = localStorage.getItem('epitrello_workspaces');
      const ws = rawWs ? JSON.parse(rawWs) : [];
      const found = (ws || []).find((w: any) => w.id === workspaceId);
      if (found) setWorkspaceName(found.title || 'Workspace');
    } catch (e) {}
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
          {boards.length === 0 && (
            <div className="text-gray-500">No boards in this workspace yet.</div>
          )}
          {boards.map((b) => (
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
    </div>
  );
}
