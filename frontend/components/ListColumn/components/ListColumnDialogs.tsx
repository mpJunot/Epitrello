'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CopyListMenu } from './CopyListMenu';
import { MoveListMenu } from './MoveListMenu';
import { MoveAllCardsMenu } from './MoveAllCardsMenu';
import { DeleteListMenu } from './DeleteListMenu';
import type { List } from '../types';

export type ListColumnDialogsProps = {
  listTitle: string;
  listId: string;
  cardsCount: number;
  totalListsCount: number;
  allLists: List[];
  showCopyDialog: boolean;
  setShowCopyDialog: (v: boolean) => void;
  showMoveDialog: boolean;
  setShowMoveDialog: (v: boolean) => void;
  showMoveAllCardsDialog: boolean;
  setShowMoveAllCardsDialog: (v: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (v: boolean) => void;
  onCopyList: (name: string) => void;
  onMoveList: (position: number) => void;
  onMoveAllCards: (targetListId: string) => void;
  onDeleteList: () => void;
};

export function ListColumnDialogs({
  listTitle,
  listId,
  cardsCount,
  totalListsCount,
  allLists,
  showCopyDialog,
  setShowCopyDialog,
  showMoveDialog,
  setShowMoveDialog,
  showMoveAllCardsDialog,
  setShowMoveAllCardsDialog,
  showDeleteDialog,
  setShowDeleteDialog,
  onCopyList,
  onMoveList,
  onMoveAllCards,
  onDeleteList,
}: ListColumnDialogsProps) {
  return (
    <>
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className='sm:max-w-md border-accent'>
          <DialogHeader>
            <DialogTitle>Copy list</DialogTitle>
            <DialogDescription>
              Create a copy of this list with all its cards.
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <CopyListMenu
              defaultName={`${listTitle} (copy)`}
              onClose={() => setShowCopyDialog(false)}
              onSubmit={(name) => {
                onCopyList(name);
                setShowCopyDialog(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className='sm:max-w-md border-accent'>
          <DialogHeader>
            <DialogTitle>Move list</DialogTitle>
            <DialogDescription>
              Move this list to a different position.
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <MoveListMenu
              totalListsCount={totalListsCount}
              onClose={() => setShowMoveDialog(false)}
              onSubmit={(position) => {
                onMoveList(position);
                setShowMoveDialog(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showMoveAllCardsDialog}
        onOpenChange={setShowMoveAllCardsDialog}
      >
        <DialogContent className='sm:max-w-md border-accent'>
          <DialogHeader>
            <DialogTitle>Move all cards</DialogTitle>
            <DialogDescription>
              Move all cards from this list to another list.
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <MoveAllCardsMenu
              sourceListId={listId}
              allLists={allLists}
              cardsCount={cardsCount}
              totalListsCount={totalListsCount}
              onClose={() => setShowMoveAllCardsDialog(false)}
              onSubmit={(targetListId) => {
                onMoveAllCards(targetListId);
                setShowMoveAllCardsDialog(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className='sm:max-w-md border-accent'>
          <DialogHeader>
            <DialogTitle>Delete list?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              list and all its cards.
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <DeleteListMenu
              listTitle={listTitle}
              cardsCount={cardsCount}
              onClose={() => setShowDeleteDialog(false)}
              onConfirm={() => {
                onDeleteList();
                setShowDeleteDialog(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
