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

const BOARD_COLORS = [
  { value: 'bg-gradient-to-r from-purple-700 to-purple-500', label: 'Purple Gradient', preview: 'bg-gradient-to-r from-purple-700 to-purple-500' },
  { value: 'bg-gradient-to-r from-pink-500 to-purple-400', label: 'Pink Purple Gradient', preview: 'bg-gradient-to-r from-pink-500 to-purple-400' },
  { value: 'bg-gradient-to-r from-orange-500 to-red-500', label: 'Orange Red Gradient', preview: 'bg-gradient-to-r from-orange-500 to-red-500' },
  { value: 'bg-gradient-to-r from-blue-600 to-blue-400', label: 'Blue Gradient', preview: 'bg-gradient-to-r from-blue-600 to-blue-400' },
  { value: 'bg-gradient-to-r from-green-600 to-green-400', label: 'Green Gradient', preview: 'bg-gradient-to-r from-green-600 to-green-400' },
  { value: 'bg-gradient-to-r from-indigo-600 to-indigo-400', label: 'Indigo Gradient', preview: 'bg-gradient-to-r from-indigo-600 to-indigo-400' },
];

export default function CreateBoardModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (payload: { name: string; workspaceId?: string; visibility?: string; background?: string }) => void }) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(BOARD_COLORS[1].value);
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
    onCreate({ name: name.trim(), workspaceId, visibility, background: selectedColor });
    setName("");
    setSelectedColor(BOARD_COLORS[1].value);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-accent">
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
              <SelectContent className="border-accent">
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
              <SelectContent className="border-accent">
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="workspace">Workspace</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {BOARD_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`relative h-12 w-full rounded-md transition-all hover:scale-105 ${
                    selectedColor === color.value
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : ''
                  } ${color.preview}`}
                  aria-label={`Select ${color.label} color`}
                  title={color.label}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white drop-shadow-lg"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
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
