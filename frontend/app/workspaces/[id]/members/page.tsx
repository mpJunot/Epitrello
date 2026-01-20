'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';

type Member = { id: string; name: string; email?: string };

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const storageKey = `epitrello_workspace_members_${workspaceId}`;
      const raw = localStorage.getItem(storageKey);
      const arr = raw ? (JSON.parse(raw) as Member[]) : null;
      if (arr) return arr;

      const sample: Member[] = [
        { id: String(Date.now() - 3000), name: 'Alice Dupont', email: 'alice@example.com' },
        { id: String(Date.now() - 2000), name: 'Bob Martin', email: 'bob@example.com' },
      ];
      try { localStorage.setItem(storageKey, JSON.stringify(sample)); } catch (_error) {}
      return sample;
    } catch (_error) {
      return [];
    }
  });

  const invite = () => {
    const email = window.prompt('Invite member email');
    if (!email) return;
    const id = String(Date.now());
    const name = email.split('@')[0];
    const next = [...members, { id, name, email }];
    setMembers(next);
    try { localStorage.setItem(`epitrello_workspace_members_${workspaceId}`, JSON.stringify(next)); } catch (e) {}
  };

  const remove = (id: string) => {
    const next = members.filter(m => m.id !== id);
    setMembers(next);
    try { localStorage.setItem(`epitrello_workspace_members_${workspaceId}`, JSON.stringify(next)); } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Workspace members</h1>
          <div>
            <button onClick={invite} className="px-3 py-1 bg-indigo-600 text-white rounded">Invite</button>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          {members.length === 0 && <div className="text-gray-500">No members</div>}
          <ul className="divide-y">
            {members.map(m => (
              <li key={m.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.email}</div>
                </div>
                <div>
                  <button onClick={() => remove(m.id)} className="px-2 py-1 text-sm bg-gray-100 rounded">Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
