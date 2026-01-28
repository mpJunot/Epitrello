'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { List } from '../../types';

interface ArchivedItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lists: List[];
}

export function ArchivedItemsDialog({ open, onOpenChange, lists }: ArchivedItemsDialogProps) {
  const archivedLists = lists.filter((list) => list.isArchived);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-accent">
        <DialogHeader>
          <DialogTitle>Archived items</DialogTitle>
          <DialogDescription>
            View and restore archived lists
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {archivedLists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No archived items</p>
            </div>
          ) : (
            <div className="space-y-2">
              {archivedLists.map((list) => (
                <div key={list.id} className="p-3 rounded border border-accent">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{list.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {list.cards?.length || 0} card(s)
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Archived
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
