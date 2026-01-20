import React from 'react';
import { MenuHeader } from './MenuCommon';

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
      className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-down overflow-hidden"
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
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
