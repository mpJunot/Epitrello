'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from '@/lib/toast';

type Workspace = { id: string; title: string; logoUrl?: string; visibility?: string; name?: string };

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const loadWorkspace = () => {
    try {
      const raw = localStorage.getItem('epitrello_workspaces');
      const arr = raw ? (JSON.parse(raw) as Workspace[]) : [];
      return (arr || []).find((w) => w.id === workspaceId) || null;
    } catch {
      return null;
    }
  };

  const initialWorkspace = loadWorkspace();
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [title, setTitle] = useState(initialWorkspace?.title || '');
  const [visibility, setVisibility] = useState(initialWorkspace?.visibility || 'PRIVATE');

  const save = () => {
    try {
      const raw = localStorage.getItem('epitrello_workspaces');
      const arr = raw ? (JSON.parse(raw) as Workspace[]) : [];
      const next = (arr || []).map((w) => (w.id === workspaceId ? { ...w, title, visibility } : w));
      localStorage.setItem('epitrello_workspaces', JSON.stringify(next));
      setWorkspace((s) => (s ? { ...s, title, visibility } : s));
      toast.success('Workspace settings saved');
    } catch {
      toast.error('Unable to save');
    }
  };

  if (!workspace) {
    return (
      <div className="min-h-screen bg-trello-hover flex items-center justify-center">
        <div className="text-trello-secondary">Workspace not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-trello-hover p-6">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Workspace settings</h1>

        <div className="mb-4">
          <label className="block text-sm text-trello-secondary mb-1">Name</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-trello-secondary mb-1">Visibility</label>
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
