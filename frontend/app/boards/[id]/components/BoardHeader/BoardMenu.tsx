'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Share2,
  Star,
  Settings,
  Tag,
  Sticker,
  Activity,
  Archive,
  EyeIcon,
  Copy,
  Mail,
  LogOut,
  Eye,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getVisibilityLabel, getVisibilityIcon } from './utils';
import { getVisibilityDescription } from '@/components/BoardView';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { toast } from '@/lib/toast';
import { createBoard, leaveBoard } from '@/lib/actions/boards';
import { ChangeBackgroundDialog } from './ChangeBackgroundDialog';
import { LabelsDialog } from './LabelsDialog';
import { AboutBoardDialog } from './AboutBoardDialog';
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from '@/components/ui/item';
import { ArchivedItemsContent } from './ArchivedItemsDialog';
import type { BoardMember } from '../../types';
import type { Board } from '../../types';
import type { List } from '../../types';

interface BoardMenuProps {
  board: Board;
  members: BoardMember[];
  lists: List[];
  canEdit?: boolean;
  onBoardUpdate?: () => void;
  onVisibilityChange?: (visibility: 'PRIVATE' | 'PUBLIC' | 'WORKSPACE') => void;
}

export function BoardMenu({
  board,
  members,
  canEdit = true,
  onBoardUpdate,
  onVisibilityChange,
}: BoardMenuProps) {
  const router = useRouter();
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copyBoardTitle, setCopyBoardTitle] = useState(`${board.title} (Copy)`);
  const [copying, setCopying] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showBackgroundDialog, setShowBackgroundDialog] = useState(false);
  const [showLabelsDialog, setShowLabelsDialog] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);

  const handleCopyBoard = async () => {
    if (!copyBoardTitle.trim()) {
      toast.error('Please enter a board name');
      return;
    }

    setCopying(true);
    try {
      const newBoard = await createBoard({
        title: copyBoardTitle,
        description: board.description || undefined,
        background: board.background || undefined,
        visibility: board.visibility,
        workspaceId: board.workspaceId || undefined,
      });

      toast.success('Board copied successfully');
      setShowCopyDialog(false);
      router.push(`/boards/${newBoard.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to copy board';
      toast.error(message);
    } finally {
      setCopying(false);
    }
  };

  const handleEmailToBoard = async () => {
    if (!emailAddress.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setSendingEmail(true);
    try {
      // TODO: Implement email-to-board functionality
      toast.info('Email-to-board feature coming soon');
      setShowEmailDialog(false);
      setEmailAddress('');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send email';
      toast.error(message);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleLeaveBoard = async () => {
    if (!confirm('Are you sure you want to leave this board?')) {
      return;
    }

    try {
      await leaveBoard(board.id);
      toast.success('You have left the board');
      router.push('/dashboard');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to leave board';
      toast.error(message);
    }
  };

  const handleStar = () => {
    // TODO: Implement star board functionality
    toast.info('Star board feature coming soon');
  };

  const handleWatch = () => {
    // TODO: Implement watch board functionality
    toast.info('Watch board feature coming soon');
  };

  const handleStickers = () => {
    toast.info('Stickers feature coming soon');
  };

  const handleActivity = () => {
    toast.info('Activity feature coming soon');
  };

  const handlePrintExportShare = () => {
    // Print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${board.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              .board-info { margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>${board.title}</h1>
            <div class="board-info">
              <p><strong>Description:</strong> ${board.description || 'No description'}</p>
              <p><strong>Visibility:</strong> ${getVisibilityLabel(board.visibility)}</p>
              <p><strong>Members:</strong> ${members.length}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='text-white hover:bg-white/20'
            title='Show menu'
          >
            <MoreHorizontal className='w-5 h-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-80 border-accent'>
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          <DropdownMenuSeparator className='bg-accent' />

          {/* Share section */}
          <div className='px-2 py-1.5'>
            <div className='flex items-center gap-2 mb-3'>
              <Share2 className='w-4 h-4' />
              <span className='text-sm font-medium'>Share</span>
              <div className='ml-auto flex items-center gap-1'>
                {members.slice(0, 5).map((member) => {
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
                    <Avatar
                      key={member.id}
                      className='h-6 w-6 border border-accent'
                    >
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
                  );
                })}
              </div>
            </div>
            <DropdownMenuItem
              className='flex items-center gap-2'
              onClick={() => setShowAboutDialog(true)}
            >
              <span>About this board</span>
            </DropdownMenuItem>
            {canEdit ? (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {getVisibilityIcon(board.visibility)}
                  <span>
                    Visibility: {getVisibilityLabel(board.visibility)}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className='border-accent w-80'>
                  <DropdownMenuItem
                    className='flex flex-col items-start gap-0.5 py-3'
                    onClick={() => onVisibilityChange?.('PRIVATE')}
                  >
                    <div className='flex w-full items-center gap-2'>
                      <Eye className='w-4 h-4 shrink-0' />
                      <span className='font-medium'>Private</span>
                      {board.visibility === 'PRIVATE' && (
                        <span className='ml-auto'>✓</span>
                      )}
                    </div>
                    <p className='text-muted-foreground text-xs pl-6 text-left'>
                      {getVisibilityDescription('PRIVATE')}
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='flex flex-col items-start gap-0.5 py-3'
                    onClick={() => onVisibilityChange?.('WORKSPACE')}
                  >
                    <div className='flex w-full items-center gap-2'>
                      <Users className='w-4 h-4 shrink-0' />
                      <span className='font-medium'>Workspace</span>
                      {board.visibility === 'WORKSPACE' && (
                        <span className='ml-auto'>✓</span>
                      )}
                    </div>
                    <p className='text-muted-foreground text-xs pl-6 text-left'>
                      {getVisibilityDescription('WORKSPACE')}
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='flex flex-col items-start gap-0.5 py-3'
                    onClick={() => onVisibilityChange?.('PUBLIC')}
                  >
                    <div className='flex w-full items-center gap-2'>
                      <EyeIcon className='w-4 h-4 shrink-0' />
                      <span className='font-medium'>Public</span>
                      {board.visibility === 'PUBLIC' && (
                        <span className='ml-auto'>✓</span>
                      )}
                    </div>
                    <p className='text-muted-foreground text-xs pl-6 text-left'>
                      {getVisibilityDescription('PUBLIC')}
                    </p>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : (
              <DropdownMenuItem className='flex items-center gap-2' disabled>
                {getVisibilityIcon(board.visibility)}
                <span>Visibility: {getVisibilityLabel(board.visibility)}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className='flex items-center gap-2'
              onClick={handlePrintExportShare}
            >
              <Share2 className='w-4 h-4' />
              <span>Print, export, and share</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='flex items-center gap-2'
              onClick={handleStar}
            >
              <Star className='w-4 h-4' />
              <span>Star</span>
            </DropdownMenuItem>
          </div>

          {canEdit && (
            <>
              <DropdownMenuSeparator className='bg-accent' />

              {/* Settings */}
              <div className='px-2 py-1.5'>
                <div className='flex items-center gap-2 mb-2'>
                  <Settings className='w-4 h-4' />
                  <span className='text-sm font-medium'>Settings</span>
                </div>
                <DropdownMenuItem
                  className='flex items-center gap-2'
                  onClick={() => setShowBackgroundDialog(true)}
                >
                  <div className='w-4 h-4 rounded bg-linear-to-br from-blue-500 to-purple-500'></div>
                  <span>Change board background</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className='bg-accent' />

              {/* Tools */}
              <div className='px-2 py-1.5'>
                <DropdownMenuItem
                  className='flex items-center gap-2'
                  onClick={() => setShowLabelsDialog(true)}
                >
                  <Tag className='w-4 h-4' />
                  <span>Labels</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='flex items-center gap-2'
                  onClick={handleStickers}
                >
                  <Sticker className='w-4 h-4' />
                  <span>Stickers</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='flex items-center gap-2'
                  onClick={handleActivity}
                >
                  <Activity className='w-4 h-4' />
                  <span>Activity</span>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className='flex items-center gap-2'>
                    <Archive className='w-4 h-4' />
                    <span>Archived items</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className='w-[380px] p-0 border-accent'>
                    <Item
                      size='sm'
                      className='border-b border-accent rounded-none'
                    >
                      <ItemContent>
                        <ItemTitle>Archived items</ItemTitle>
                        <ItemDescription>
                          View and restore archived lists and cards
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                    <ArchivedItemsContent
                      boardId={board.id}
                      onRestore={onBoardUpdate}
                    />
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                  className='flex items-center gap-2'
                  onClick={handleWatch}
                >
                  <EyeIcon className='w-4 h-4' />
                  <span>Watch</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className='bg-accent' />

              {/* Actions */}
              <div className='px-2 py-1.5'>
                <DropdownMenuItem
                  className='flex items-center gap-2'
                  onClick={() => setShowCopyDialog(true)}
                >
                  <Copy className='w-4 h-4' />
                  <span>Copy board</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='flex items-center gap-2'
                  onClick={() => setShowEmailDialog(true)}
                >
                  <Mail className='w-4 h-4' />
                  <span>Email-to-board</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='flex items-center gap-2 text-red-600'
                  onClick={handleLeaveBoard}
                >
                  <LogOut className='w-4 h-4' />
                  <span>Leave board</span>
                </DropdownMenuItem>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Copy Board Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className='sm:max-w-md border-accent'>
          <DialogHeader>
            <DialogTitle>Copy board</DialogTitle>
            <DialogDescription>
              Create a new board with the same title, description, background
              and visibility. The new board will have default lists (To Do,
              Doing, Done).
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='copy-board-title'>Board name</Label>
              <Input
                id='copy-board-title'
                placeholder='Enter board name'
                value={copyBoardTitle}
                onChange={(e) => setCopyBoardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCopyBoard();
                  }
                }}
              />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setShowCopyDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCopyBoard}
                disabled={copying || !copyBoardTitle.trim()}
              >
                {copying ? 'Copying...' : 'Copy board'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email-to-board Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className='sm:max-w-md border-accent'>
          <DialogHeader>
            <DialogTitle>Email-to-board</DialogTitle>
            <DialogDescription>
              Send emails to this board. Emails will be converted to cards.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='email-address'>Email address</Label>
              <Input
                id='email-address'
                type='email'
                placeholder='Enter email address'
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEmailToBoard();
                  }
                }}
              />
              <p className='text-xs text-muted-foreground'>
                Send emails to this address to create cards on this board
              </p>
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setShowEmailDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEmailToBoard}
                disabled={sendingEmail || !emailAddress.trim()}
              >
                {sendingEmail ? 'Sending...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ChangeBackgroundDialog
        open={showBackgroundDialog}
        onOpenChange={setShowBackgroundDialog}
        board={board}
        onUpdate={() => {
          onBoardUpdate?.();
          window.location.reload();
        }}
      />

      <LabelsDialog
        open={showLabelsDialog}
        onOpenChange={setShowLabelsDialog}
        boardId={board.id}
      />

      <AboutBoardDialog
        open={showAboutDialog}
        onOpenChange={setShowAboutDialog}
        board={board}
        members={members}
      />
    </>
  );
}
