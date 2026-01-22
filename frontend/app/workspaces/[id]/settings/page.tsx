'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">Workspace not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-3xl mx-auto bg-card rounded shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Workspace settings</h1>

        <div className="mb-4">
          <Label htmlFor="workspace-name">Name</Label>
          <Input id="workspace-name" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="mb-4">
          <Label htmlFor="workspace-visibility">Visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger id="workspace-visibility">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRIVATE">Private</SelectItem>
              <SelectItem value="WORKSPACE">Workspace</SelectItem>
              <SelectItem value="PUBLIC">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
}
