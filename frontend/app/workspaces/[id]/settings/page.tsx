'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const [workspace, setWorkspace] = useState<{ id: string; title: string; logoUrl?: string; visibility?: string } | null>(null);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('PRIVATE');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('epitrello_workspaces');
      const arr = raw ? JSON.parse(raw) : [];
      const found = (arr || []).find((w: any) => w.id === workspaceId);
      if (found) {
        setWorkspace(found);
        setTitle(found.title || '');
        setVisibility(found.visibility || 'PRIVATE');
      }
    } catch (e) {}
  }, [workspaceId]);

  const save = () => {
    try {
      const raw = localStorage.getItem('epitrello_workspaces');
      const arr = raw ? JSON.parse(raw) : [];
      const next = (arr || []).map((w: any) => (w.id === workspaceId ? { ...w, title, visibility } : w));
      localStorage.setItem('epitrello_workspaces', JSON.stringify(next));
      setWorkspace((s) => s ? { ...s, title, visibility } : s);
      alert('Workspace settings saved');
    } catch (e) { alert('Unable to save'); }
  };

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Workspace not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Workspace settings</h1>

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Name</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Visibility</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full px-3 py-2 border rounded">
            <option value="PRIVATE">Private</option>
            <option value="WORKSPACE">Workspace</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={save} className="px-3 py-1 bg-indigo-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
