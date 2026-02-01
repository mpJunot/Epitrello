import React from 'react';
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
    <div className="space-y-4">
      <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
        <p className="text-sm text-destructive font-medium mb-2">
          ⚠️ This action is irreversible
        </p>
        <p className="text-sm text-muted-foreground">
          Deleting this list will permanently remove <strong>&quot;{listTitle}&quot;</strong> and all its {cardsCount} card{cardsCount !== 1 ? 's' : ''}. This cannot be undone.
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          onClick={onClose}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="destructive"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
