import React from 'react';
import { MenuHeader } from './MenuCommon';
import { Button } from "@/components/ui/button";

type DeleteListMenuProps = {
  listTitle: string;
  cardsCount: number;
  onClose: () => void;
  onConfirm: () => void;
};

export const DeleteListMenu: React.FC<DeleteListMenuProps> = ({
  listTitle,
  cardsCount,
  onClose,
  onConfirm,
}) => {
  return (
    <div
      className="absolute right-0 top-full mt-1 w-72 bg-trello-card-bg rounded-lg shadow-lg border border-trello-border z-50 animate-slide-down overflow-hidden"
      role="dialog"
      aria-label="Delete list confirmation"
    >
      <MenuHeader title="Delete list?" onClose={onClose} />

      <div className="p-4 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-800 font-medium mb-2">
            ⚠️ This action is irreversible
          </p>
          <p className="text-xs text-red-700">
            Deleting this list will permanently remove <strong>&quot;{listTitle}&quot;</strong> and all its {cardsCount} card{cardsCount !== 1 ? 's' : ''}. This cannot be undone.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="destructive"
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
