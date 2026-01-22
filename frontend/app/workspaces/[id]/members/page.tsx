'use client';

import React, { useState, useEffect } from 'react';
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
import { getWorkspaceMembers, inviteMember, removeMember } from '@/lib/actions/workspaces';
import { toast } from '@/lib/toast';

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const [members, setMembers] = useState<Array<{ id: string; userId: string; name: string; email: string; role: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      try {
        const wsMembers = await getWorkspaceMembers(workspaceId);
        const mapped = wsMembers.map((m) => ({
          id: m.id,
          userId: m.userId,
          name: m.user.name,
          email: m.user.email,
          role: m.role,
        }));
        setMembers(mapped);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load members';
        toast.error(message);
        console.error('Failed to load workspace members', error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [workspaceId]);

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    setRemoving(userId);
    try {
      await removeMember(workspaceId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      toast.success('Member removed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove member';
      toast.error(message);
      console.error('Failed to remove member', error);
    } finally {
      setRemoving(null);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      await inviteMember(workspaceId, inviteEmail.trim());
      toast.success('Invitation sent');
      setInviteEmail("");
      setShowInviteDialog(false);
      // Reload members to show the new invitation
      const wsMembers = await getWorkspaceMembers(workspaceId);
      const mapped = wsMembers.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
      }));
      setMembers(mapped);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to invite member';
      toast.error(message);
      console.error('Failed to invite member', error);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

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
                  <div className="text-xs text-muted-foreground mt-1">Role: {m.role}</div>
                </div>
                <div>
                  <Button
                    onClick={() => handleRemove(m.userId)}
                    variant="secondary"
                    size="sm"
                    disabled={removing === m.userId}
                  >
                    {removing === m.userId ? 'Removing...' : 'Remove'}
                  </Button>
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
            <Button variant="secondary" onClick={() => setShowInviteDialog(false)} disabled={inviting}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim() || inviting}>
              {inviting ? 'Inviting...' : 'Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
