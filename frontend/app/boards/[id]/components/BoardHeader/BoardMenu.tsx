'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Share2,
  Star,
  Settings,
  Tag,
  Activity,
  Archive,
  EyeIcon,
  Copy,
  LayoutTemplate,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getVisibilityLabel, getVisibilityIcon } from './utils';
import { getVisibilityDescription } from '@/components/BoardView';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { toast } from '@/lib/toast';
import {
  copyBoard,
  leaveBoard,
  updateBoardMemberRole,
} from '@/lib/actions/boards';
import { createTemplateFromBoard } from '@/lib/actions/templates';
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
import { BoardActivityList } from './ActivityPopover';
import { BoardMenuDialogs } from './BoardMenuDialogs';
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
  /** Current user id (to detect if they are the only admin when leaving). */
  currentUserId?: string | null;
}

export function BoardMenu({
  board,
  members,
  canEdit = true,
  onBoardUpdate,
  onVisibilityChange,
  currentUserId,
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
  const [showLeaveBoardDialog, setShowLeaveBoardDialog] = useState(false);
  const [leaveBoardAdminUserId, setLeaveBoardAdminUserId] = useState('');
  const [leavingBoard, setLeavingBoard] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [showSaveAsTemplateDialog, setShowSaveAsTemplateDialog] = useState(false);
  const [saveAsTemplateName, setSaveAsTemplateName] = useState(board.title);
  const [savingAsTemplate, setSavingAsTemplate] = useState(false);

  const STARRED_STORAGE_KEY = 'epitrello-starred-board-ids';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STARRED_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.some((id) => id === board.id)) {
        setIsStarred(true);
      }
    } catch {
      // ignore
    }
  }, [board.id]);

  const isOnlyAdmin =
    !!currentUserId &&
    members.filter((m) => m.role === 'ADMIN').length === 1 &&
    members.some((m) => m.userId === currentUserId && m.role === 'ADMIN');

  const otherBoardMembersToPromote = members.filter(
    (m) => m.userId !== currentUserId && m.role !== 'ADMIN',
  );

  const handleSaveAsTemplate = async () => {
    if (!saveAsTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    setSavingAsTemplate(true);
    try {
      await createTemplateFromBoard(board.id, saveAsTemplateName.trim());
      toast.success('Template created');
      setShowSaveAsTemplateDialog(false);
      router.push('/templates');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create template';
      toast.error(message);
    } finally {
      setSavingAsTemplate(false);
    }
  };

  const handleCopyBoard = async () => {
    if (!copyBoardTitle.trim()) {
      toast.error('Please enter a board name');
      return;
    }

    setCopying(true);
    try {
      const newBoard = await copyBoard({
        sourceBoardId: board.id,
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

  const handleLeaveBoardClick = () => {
    if (isOnlyAdmin && otherBoardMembersToPromote.length > 0) {
      setLeaveBoardAdminUserId('');
      setShowLeaveBoardDialog(true);
    } else if (isOnlyAdmin && otherBoardMembersToPromote.length === 0) {
      toast.error(
        'You are the last admin. Add another member to the board and assign them as admin before leaving.',
      );
    } else {
      if (!confirm('Are you sure you want to leave this board?')) return;
      handleLeaveBoard();
    }
  };

  const handleLeaveBoard = async () => {
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

  const handleAssignAdminAndLeaveBoard = async () => {
    if (!leaveBoardAdminUserId) {
      toast.error('Please select a member to assign as admin');
      return;
    }
    setLeavingBoard(true);
    try {
      await updateBoardMemberRole(board.id, leaveBoardAdminUserId, 'ADMIN');
      await leaveBoard(board.id);
      toast.success('You have left the board');
      setShowLeaveBoardDialog(false);
      router.push('/dashboard');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to assign admin or leave board';
      toast.error(message);
    } finally {
      setLeavingBoard(false);
    }
  };

  const handleStar = () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STARRED_STORAGE_KEY);
      const parsed = Array.isArray(raw ? JSON.parse(raw) : [])
        ? (JSON.parse(raw!) as string[])
        : [];
      const exists = parsed.includes(board.id);
      const next = exists
        ? parsed.filter((id) => id !== board.id)
        : [...parsed, board.id];
      localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify(next));
      setIsStarred(!exists);
      toast.success(exists ? 'Board unstarred' : 'Board starred');
    } catch {
      toast.error('Failed to update board star status');
    }
  };

  const handleWatch = () => {
    // TODO: Implement watch board functionality
    toast.info('Watch board feature coming soon');
  };

  const handlePrintExportShare = () => {
    const escapeHtml = (s: string) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const title = escapeHtml(board.title);
    const description = escapeHtml(board.description || 'No description');
    const visibility = escapeHtml(getVisibilityLabel(board.visibility));
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              .board-info { margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <div class="board-info">
              <p><strong>Description:</strong> ${description}</p>
              <p><strong>Visibility:</strong> ${visibility}</p>
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
                        className='object-cover'
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
              <Star
                className={`w-4 h-4 ${isStarred ? 'fill-current text-yellow-400' : ''}`}
              />
              <span>{isStarred ? 'Unstar' : 'Star'}</span>
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
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className='flex items-center gap-2'>
                    <Activity className='w-4 h-4' />
                    <span>Activity</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className='w-[380px] p-0 border-accent'>
                    <BoardActivityList
                      boardId={board.id}
                      boardTitle={board.title}
                    />
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
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
                  onClick={() => {
                    setSaveAsTemplateName(board.title);
                    setShowSaveAsTemplateDialog(true);
                  }}
                >
                  <LayoutTemplate className='w-4 h-4' />
                  <span>Save as template</span>
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
                  onClick={handleLeaveBoardClick}
                >
                  <LogOut className='w-4 h-4' />
                  <span>Leave board</span>
                </DropdownMenuItem>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <BoardMenuDialogs
        showCopyDialog={showCopyDialog}
        setShowCopyDialog={setShowCopyDialog}
        copyBoardTitle={copyBoardTitle}
        setCopyBoardTitle={setCopyBoardTitle}
        copying={copying}
        onCopyBoard={handleCopyBoard}
        showSaveAsTemplateDialog={showSaveAsTemplateDialog}
        setShowSaveAsTemplateDialog={setShowSaveAsTemplateDialog}
        saveAsTemplateName={saveAsTemplateName}
        setSaveAsTemplateName={setSaveAsTemplateName}
        savingAsTemplate={savingAsTemplate}
        onSaveAsTemplate={handleSaveAsTemplate}
        showEmailDialog={showEmailDialog}
        setShowEmailDialog={setShowEmailDialog}
        emailAddress={emailAddress}
        setEmailAddress={setEmailAddress}
        sendingEmail={sendingEmail}
        onEmailToBoard={handleEmailToBoard}
        showLeaveBoardDialog={showLeaveBoardDialog}
        setShowLeaveBoardDialog={setShowLeaveBoardDialog}
        leaveBoardAdminUserId={leaveBoardAdminUserId}
        setLeaveBoardAdminUserId={setLeaveBoardAdminUserId}
        leavingBoard={leavingBoard}
        otherBoardMembersToPromote={otherBoardMembersToPromote}
        onAssignAdminAndLeave={handleAssignAdminAndLeaveBoard}
      />

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
