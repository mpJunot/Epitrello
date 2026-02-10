'use client';

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
import type { BoardMember } from '../../types';

export type BoardMenuDialogsProps = {
  showCopyDialog: boolean;
  setShowCopyDialog: (v: boolean) => void;
  copyBoardTitle: string;
  setCopyBoardTitle: (v: string) => void;
  copying: boolean;
  onCopyBoard: () => Promise<void>;
  showSaveAsTemplateDialog: boolean;
  setShowSaveAsTemplateDialog: (v: boolean) => void;
  saveAsTemplateName: string;
  setSaveAsTemplateName: (v: string) => void;
  savingAsTemplate: boolean;
  onSaveAsTemplate: () => Promise<void>;
  showEmailDialog: boolean;
  setShowEmailDialog: (v: boolean) => void;
  emailAddress: string;
  setEmailAddress: (v: string) => void;
  sendingEmail: boolean;
  onEmailToBoard: () => Promise<void>;
  showLeaveBoardDialog: boolean;
  setShowLeaveBoardDialog: (v: boolean) => void;
  leaveBoardAdminUserId: string;
  setLeaveBoardAdminUserId: (v: string) => void;
  leavingBoard: boolean;
  otherBoardMembersToPromote: BoardMember[];
  onAssignAdminAndLeave: () => Promise<void>;
};

export function BoardMenuDialogs({
  showCopyDialog,
  setShowCopyDialog,
  copyBoardTitle,
  setCopyBoardTitle,
  copying,
  onCopyBoard,
  showSaveAsTemplateDialog,
  setShowSaveAsTemplateDialog,
  saveAsTemplateName,
  setSaveAsTemplateName,
  savingAsTemplate,
  onSaveAsTemplate,
  showEmailDialog,
  setShowEmailDialog,
  emailAddress,
  setEmailAddress,
  sendingEmail,
  onEmailToBoard,
  showLeaveBoardDialog,
  setShowLeaveBoardDialog,
  leaveBoardAdminUserId,
  setLeaveBoardAdminUserId,
  leavingBoard,
  otherBoardMembersToPromote,
  onAssignAdminAndLeave,
}: BoardMenuDialogsProps) {
  return (
    <>
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className='sm:max-w-md border-accent'>
          <DialogHeader>
            <DialogTitle>Copy board</DialogTitle>
            <DialogDescription>
              Create a new board with the same lists, cards, labels and
              checklists. You will be the only member. Comments and attachments
              are not copied.
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
                    onCopyBoard();
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
                onClick={onCopyBoard}
                disabled={copying || !copyBoardTitle.trim()}
              >
                {copying ? 'Copying...' : 'Copy board'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaveAsTemplateDialog} onOpenChange={setShowSaveAsTemplateDialog}>
        <DialogContent className='sm:max-w-md border-accent'>
          <DialogHeader>
            <DialogTitle>Save as template</DialogTitle>
            <DialogDescription>
              Create a reusable template from this board. Lists and card titles
              will be saved so you can create new boards from it later.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='save-as-template-name'>Template name</Label>
              <Input
                id='save-as-template-name'
                placeholder='Enter template name'
                value={saveAsTemplateName}
                onChange={(e) => setSaveAsTemplateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveAsTemplate();
                }}
              />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setShowSaveAsTemplateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={onSaveAsTemplate}
                disabled={savingAsTemplate || !saveAsTemplateName.trim()}
              >
                {savingAsTemplate ? 'Creating...' : 'Create template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLeaveBoardDialog} onOpenChange={setShowLeaveBoardDialog}>
        <DialogContent className='sm:max-w-md border-accent'>
          <DialogHeader>
            <DialogTitle>Assign an admin before leaving</DialogTitle>
            <DialogDescription>
              You are the last admin on this board. Choose a member to assign as
              admin, then you can leave the board.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>Member to assign as admin</Label>
              <Select
                value={leaveBoardAdminUserId}
                onValueChange={setLeaveBoardAdminUserId}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a member...' />
                </SelectTrigger>
                <SelectContent>
                  {otherBoardMembersToPromote.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.user?.name || m.user?.email || 'Member'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setShowLeaveBoardDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={onAssignAdminAndLeave}
                disabled={leavingBoard || !leaveBoardAdminUserId}
                className='bg-orange-500 hover:bg-orange-600 text-white border-0'
              >
                {leavingBoard ? 'Leaving...' : 'Assign as admin and leave'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                    onEmailToBoard();
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
                onClick={onEmailToBoard}
                disabled={sendingEmail || !emailAddress.trim()}
              >
                {sendingEmail ? 'Sending...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
