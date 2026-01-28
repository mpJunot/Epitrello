'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import type { BoardMember } from '../../types';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: BoardMember[];
}

export function ShareDialog({ open, onOpenChange, members }: ShareDialogProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  const handleInvite = () => {
    // TODO: Implement invite functionality
    console.log('Invite:', inviteEmail, inviteRole);
    setInviteEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-accent">
        <DialogHeader>
          <DialogTitle>Share board</DialogTitle>
          <DialogDescription>
            Invite people to collaborate on this board
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Invite section */}
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address or name</Label>
            <div className="flex gap-2">
              <Input
                id="invite-email"
                placeholder="Enter email or name"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-accent">
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite}>Share</Button>
            </div>
          </div>

          {/* Share link */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Share2 className="w-4 h-4" />
              <span>Share this board with a link</span>
            </div>
            <Button variant="link" className="p-0 h-auto">
              Create link
            </Button>
          </div>

          <Separator />

          {/* Board members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Board members</h3>
              <span className="text-xs text-muted-foreground">{members.length}</span>
            </div>
            <div className="space-y-2">
              {members.map((member) => {
                const displayName = member.user?.name || member.user?.email || 'U';
                const initials = member.user?.name
                  ? member.user.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()
                  : (member.user?.email?.charAt(0) || 'U').toUpperCase();
                const avatarColor = getAvatarColor(displayName);
                return (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user?.avatar ? member.user.avatar : undefined} />
                        <AvatarFallback className={`text-xs text-white ${avatarColor}`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {member.user?.name || member.user?.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.user?.email}
                        </div>
                      </div>
                    </div>
                    <Select defaultValue={member.role}>
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-accent">
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
