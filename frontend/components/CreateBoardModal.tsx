"use client";

import React, { useState } from "react";

type Workspace = { id: string; title: string };

export default function CreateBoardModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (payload: { name: string; workspaceId?: string; visibility?: string }) => void }) {
  const [name, setName] = useState("");
  const loadWorkspaces = (): Workspace[] => {
    try {
      const raw = localStorage.getItem('epitrello_workspaces');
      const ws = raw ? (JSON.parse(raw) as Workspace[]) : [];
      if (!ws || ws.length === 0) {
        const defaults: Workspace[] = [
          { id: String(Date.now() - 2000), title: 'Personal' },
          { id: String(Date.now() - 1000), title: 'Acme Corp' },
        ];
        try { localStorage.setItem('epitrello_workspaces', JSON.stringify(defaults)); } catch {}
        return defaults;
      }
      return ws;
    } catch {
      return [];
    }
  };

  const [workspaces] = useState<Workspace[]>(loadWorkspaces);
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(() => loadWorkspaces()[0]?.id);
  const [visibility, setVisibility] = useState<string>("personal");

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return alert('Please provide a name');
    onCreate({ name: name.trim(), workspaceId, visibility });
    setName("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <form onSubmit={submit} className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Créer un nouveau tableau</h3>

        <div className="mb-3">
          <label className="block text-sm text-gray-700 mb-1">Nom</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded text-gray-900 placeholder-gray-400"
            placeholder="Nom du tableau"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm text-gray-700 mb-1">Workspace</label>
          <select
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="w-full px-3 py-2 border rounded text-gray-900"
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id} className="text-black">{w.title}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Visibilité</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full px-3 py-2 border rounded text-gray-900"
          >
            <option value="personal" className="text-black">Personal</option>
            <option value="workspace" className="text-black">Workspace</option>
            <option value="public" className="text-black">Public</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => { setName(''); onClose(); }}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded"
          >
            Annuler
          </button>
          <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Créer</button>
        </div>
      </form>
    </div>
  );
}
