'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { getVisibilityLabel, getVisibilityIcon } from './utils';
import type { Board } from '../../types';
import type { BoardMember } from '../../types';

interface AboutBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board;
  members: BoardMember[];
}

export function AboutBoardDialog({ open, onOpenChange, board, members }: AboutBoardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About this board</DialogTitle>
          <DialogDescription>
            Board information and details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Title</div>
            <div className="text-sm text-muted-foreground">{board.title}</div>
          </div>

          {board.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium">Description</div>
                <div className="text-sm text-muted-foreground">{board.description}</div>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">Visibility</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getVisibilityIcon(board.visibility)}
              <span>{getVisibilityLabel(board.visibility)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">Members</div>
            <div className="text-sm text-muted-foreground">{members.length} member(s)</div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">Created</div>
            <div className="text-sm text-muted-foreground">
              {board.createdAt ? new Date(board.createdAt).toLocaleDateString() : 'Unknown'}
            </div>
          </div>

          {board.updatedAt && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium">Last updated</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(board.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
