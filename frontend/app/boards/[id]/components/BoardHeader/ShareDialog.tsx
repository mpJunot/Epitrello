'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Share2, Copy, Check } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { getUserByEmail } from '@/lib/actions/users';
import { addBoardMember } from '@/lib/actions/boards';
import { activityInvalidateKey, activityBoardInvalidateKey } from '@/lib/queries/activity';
import { toast } from '@/lib/toast';
import type { BoardMember } from '../../types';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  members: BoardMember[];
  onMemberAdded?: () => void;
}

export function ShareDialog({
  open,
  onOpenChange,
  boardId,
  members,
  onMemberAdded,
}: ShareDialogProps) {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const boardShareLink = useMemo(
    () =>
      typeof window !== 'undefined'
        ? `${window.location.origin}/boards/${boardId}`
        : '',
    [boardId]
  );

  const handleCopyLink = async () => {
    if (!boardShareLink) return;
    try {
      await navigator.clipboard.writeText(boardShareLink);
      setLinkCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    setInviteLoading(true);
    try {
      const user = await getUserByEmail(email);
      if (!user) {
        toast.error('No user found with this email address');
        return;
      }
      const alreadyMember = members.some((m) => m.userId === user.id);
      if (alreadyMember) {
        toast.error('This person is already a board member');
        return;
      }
      await addBoardMember(boardId, user.id, inviteRole);
      await queryClient.invalidateQueries({ queryKey: activityInvalidateKey });
      await queryClient.invalidateQueries({ queryKey: activityBoardInvalidateKey });
      toast.success(`${user.name || user.email} has been added to the board`);
      setInviteEmail('');
      onMemberAdded?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add member';
      toast.error(message);
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md border-accent'>
        <DialogHeader>
          <DialogTitle>Share board</DialogTitle>
          <DialogDescription>
            Invite people to collaborate on this board
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          {/* Invite section */}
          <div className='space-y-2'>
            <Label htmlFor='invite-email'>Email address or name</Label>
            <div className='flex gap-2'>
              <Input
                id='invite-email'
                placeholder='Enter email or name'
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className='flex-1'
              />
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as 'MEMBER' | 'ADMIN')}
              >
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='border-accent'>
                  <SelectItem value='MEMBER'>Member</SelectItem>
                  <SelectItem value='ADMIN'>Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={inviteLoading}>
                {inviteLoading ? 'Adding…' : 'Share'}
              </Button>
            </div>
          </div>

          {/* Share link */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2 text-sm'>
              <Share2 className='w-4 h-4' />
              Share this board with a link
            </Label>
            <div className='flex gap-2'>
              <Input
                readOnly
                value={boardShareLink}
                className='flex-1 font-mono text-xs bg-muted/50'
              />
              <Button
                type='button'
                variant='secondary'
                size='icon'
                onClick={handleCopyLink}
                title='Copy link'
                className='shrink-0'
              >
                {linkCopied ? (
                  <Check className='w-4 h-4 text-green-600' />
                ) : (
                  <Copy className='w-4 h-4' />
                )}
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>
              Anyone with this link can open the board (access depends on board
              visibility).
            </p>
          </div>

          <Separator />

          {/* Board members */}
          <div>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-sm font-medium'>Board members</h3>
              <span className='text-xs text-muted-foreground'>
                {members.length}
              </span>
            </div>
            <div className='space-y-2'>
              {members.map((member) => {
                const displayName =
                  member.user?.name || member.user?.email || 'U';
                const initials = member.user?.name
                  ? member.user.name
                      .split(' ')
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : (member.user?.email?.charAt(0) || 'U').toUpperCase();
                const avatarColor = getAvatarColor(displayName);
                return (
                  <div
                    key={member.id}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={
                            member.user?.avatar ? member.user.avatar : undefined
                          }
                        />
                        <AvatarFallback
                          className={`text-xs text-white ${avatarColor}`}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='text-sm font-medium'>
                          {member.user?.name || member.user?.email}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {member.user?.email}
                        </div>
                      </div>
                    </div>
                    <Select defaultValue={member.role}>
                      <SelectTrigger className='w-24 h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='border-accent'>
                        <SelectItem value='MEMBER'>Member</SelectItem>
                        <SelectItem value='ADMIN'>Admin</SelectItem>
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
