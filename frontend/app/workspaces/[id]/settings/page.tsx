'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useParams, useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { deleteWorkspace } from '@/lib/actions/workspaces';

type Workspace = { id: string; title: string; logoUrl?: string; visibility?: string; name?: string };

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [hydrated, setHydrated] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('epitrello_workspaces') : null;
      const arr = raw ? (JSON.parse(raw) as Workspace[]) : [];
      const found = (arr || []).find((w) => w.id === workspaceId) || null;
      setWorkspace(found);
      setTitle(found?.title || '');
      setVisibility(found?.visibility || 'PRIVATE');
    } catch {
      setWorkspace(null);
    } finally {
      setHydrated(true);
    }
  }, [workspaceId]);

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

  const handleDelete = async () => {
    setDeleteError(null);
    setDeleting(true);
    try {
      const ok = await deleteWorkspace(workspaceId);
      if (!ok) throw new Error('Deletion failed');

      try {
        const raw = localStorage.getItem('epitrello_workspaces');
        const arr = raw ? (JSON.parse(raw) as Workspace[]) : [];
        const next = (arr || []).filter((w) => w.id !== workspaceId);
        localStorage.setItem('epitrello_workspaces', JSON.stringify(next));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('epitrello:workspaces:changed'));
        }
      } catch {}

      toast.success('Workspace deleted');
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete workspace';
      setDeleteError(message);
      toast.error(message);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">Loading workspace...</div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">Workspace not found</div>
      </div>
    );
  }

  return (
    <>
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

          <Separator className="my-6" />

          <div className="space-y-3">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-foreground">
              <div className="font-medium text-destructive">Danger zone</div>
              <div className="text-muted-foreground">Deleting this workspace will remove all its data.</div>
            </div>

            {deleteError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
                {deleteError}
              </div>
            )}

            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
              className="w-full sm:w-auto"
            >
              Delete Workspace
            </Button>
          </div>
        </div>
      </div>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this workspace?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data for this workspace will be removed permanently.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-muted-foreground">
            You will be redirected to your workspace list after deletion.
          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
