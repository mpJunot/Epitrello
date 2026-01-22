'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      try { localStorage.setItem(storageKey, JSON.stringify(sample)); } catch {}
      return sample;
    } catch {
      return [];
    }
  });

  const remove = (id: string) => {
    const next = members.filter(m => m.id !== id);
    setMembers(next);
    try { localStorage.setItem(`epitrello_workspace_members_${workspaceId}`, JSON.stringify(next)); } catch {}
  };

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const id = String(Date.now());
    const name = inviteEmail.split('@')[0];
    const next = [...members, { id, name, email: inviteEmail }];
    setMembers(next);
    try { localStorage.setItem(`epitrello_workspace_members_${workspaceId}`, JSON.stringify(next)); } catch {}
    setInviteEmail("");
    setShowInviteDialog(false);
  };

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-foreground">Workspace members</h1>
          <div>
            <Button onClick={() => setShowInviteDialog(true)}>Invite</Button>
          </div>
        </div>

        <div className="bg-card rounded shadow p-4">
          {members.length === 0 && <div className="text-muted-foreground">No members</div>}
          <ul className="divide-y divide-border">
            {members.map(m => (
              <li key={m.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </div>
                <div>
                  <Button onClick={() => remove(m.id)} variant="secondary" size="sm">Remove</Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
            <DialogDescription>
              Enter the email address of the member you want to invite to this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="email@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleInvite();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
