import React from 'react';
import { Button } from "@/components/ui/button";

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
    <div className="absolute right-0 top-full mt-1 w-60 bg-trello-card-bg rounded-lg shadow-lg border border-trello-border z-50 animate-slide-down overflow-hidden" role="menu">
      <div className="px-4 py-3 border-b border-trello-border">
        <h4 className="text-sm font-semibold text-trello">List actions</h4>
      </div>

      <div className="py-1">
        <Button
          variant="ghost"
          className="w-full justify-start"
          role="menuitem"
          onClick={() => {
            onClose();
            onAddCard();
          }}
        >
          Add card
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          role="menuitem"
          onClick={onCopyList}
        >
          Copy list
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          role="menuitem"
          onClick={onMoveList}
          disabled={totalListsCount <= 1}
          title={totalListsCount <= 1 ? 'No other lists available' : ''}
          aria-disabled={totalListsCount <= 1}
        >
          Move list
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
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
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-between"
          role="menuitem"
          onClick={onSort}
          disabled={cardsCount === 0}
          title={cardsCount === 0 ? 'No cards to sort' : ''}
          aria-disabled={cardsCount === 0}
        >
          <span>Sort by…</span>
          {activeSortOption && cardsCount > 0 && (
            <span className="text-xs text-trello-blue font-medium" aria-label="Sort active">●</span>
          )}
        </Button>

        <div className="border-t border-trello-border my-1"></div>

        <Button
          variant="destructive"
          className="w-full justify-start"
          role="menuitem"
          onClick={onDelete}
        >
          Delete list
        </Button>
      </div>
    </div>
  );
};
