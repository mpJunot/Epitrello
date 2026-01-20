"use client";

import React, { useState } from "react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    if (!name.trim()) {
      toast.error('Please provide a name');
      return;
    }
    onCreate({ name: name.trim(), workspaceId, visibility });
    setName("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new board</DialogTitle>
          <DialogDescription>
            Create a new board for your workspace
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board-name">Name</Label>
            <Input
              id="board-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Board name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-workspace">Workspace</Label>
            <Select value={workspaceId} onValueChange={(value) => setWorkspaceId(value)}>
              <SelectTrigger id="board-workspace">
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(value) => setVisibility(value)}>
              <SelectTrigger id="board-visibility">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="workspace">Workspace</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setName(''); onClose(); }}
            >
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
