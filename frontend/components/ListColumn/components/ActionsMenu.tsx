import React from 'react';

type ActionsMenuProps = {
  onClose: () => void;
  onAddCard: () => void;
  onCopyList: () => void;
  onMoveList: () => void;
  onMoveAllCards: () => void;
  onSort: () => void;
  onDelete: () => void;
  totalListsCount: number;
  cardsCount: number;
  activeSortOption: string | null;
};

export const ActionsMenu: React.FC<ActionsMenuProps> = ({
  onClose,
  onAddCard,
  onCopyList,
  onMoveList,
  onMoveAllCards,
  onSort,
  onDelete,
  totalListsCount,
  cardsCount,
  activeSortOption,
}) => {
  return (
    <div className="absolute right-0 top-full mt-1 w-60 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-down overflow-hidden" role="menu">
      <div className="px-4 py-3 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700">List actions</h4>
      </div>

      <div className="py-1">
        <button
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
          role="menuitem"
          onClick={() => {
            onClose();
            onAddCard();
          }}
        >
          Add card
        </button>
        
        <button
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
          role="menuitem"
          onClick={onCopyList}
        >
          Copy list
        </button>

        <button
          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
            totalListsCount <= 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
          }`}
          role="menuitem"
          onClick={onMoveList}
          disabled={totalListsCount <= 1}
          title={totalListsCount <= 1 ? 'No other lists available' : ''}
          aria-disabled={totalListsCount <= 1}
        >
          Move list
        </button>

        <button
          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
            totalListsCount <= 1 || cardsCount === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
          }`}
          role="menuitem"
          onClick={onMoveAllCards}
          disabled={totalListsCount <= 1 || cardsCount === 0}
          title={
            totalListsCount <= 1
              ? 'No other lists available'
              : cardsCount === 0
              ? 'No cards to move'
              : ''
          }
          aria-disabled={totalListsCount <= 1 || cardsCount === 0}
        >
          Move all cards in this list
        </button>

        <button
          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
            cardsCount === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
          }`}
          role="menuitem"
          onClick={onSort}
          disabled={cardsCount === 0}
          title={cardsCount === 0 ? 'No cards to sort' : ''}
          aria-disabled={cardsCount === 0}
        >
          <span>Sort by…</span>
          {activeSortOption && cardsCount > 0 && (
            <span className="text-xs text-indigo-600 font-medium" aria-label="Sort active">●</span>
          )}
        </button>

        <div className="border-t border-gray-200 my-1"></div>

        <button
          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-colors"
          role="menuitem"
          onClick={onDelete}
        >
          Delete list
        </button>
      </div>
    </div>
  );
};
