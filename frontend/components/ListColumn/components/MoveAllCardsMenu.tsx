import React, { useState } from 'react';
import { MenuHeader } from './MenuCommon';
import { List } from '../types';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type MoveAllCardsMenuProps = {
  sourceListId: string;
  allLists: List[];
  cardsCount: number;
  totalListsCount: number;
  onClose: () => void;
  onSubmit: (targetListId: string) => void;
};

export const MoveAllCardsMenu: React.FC<MoveAllCardsMenuProps> = ({
  sourceListId,
  allLists,
  cardsCount,
  totalListsCount,
  onClose,
  onSubmit,
}) => {
  const [targetListId, setTargetListId] = useState("");

  return (
    <div
      className="absolute right-0 top-full mt-1 w-72 bg-trello-card-bg rounded-lg shadow-lg border border-trello-border z-50 animate-slide-down overflow-hidden"
      role="dialog"
      aria-label="Move all cards"
    >
      <MenuHeader title="Move all cards" onClose={onClose} />

      <div className="p-4 space-y-4">
        {totalListsCount <= 1 && (
          <div className="bg-trello-blue-light border border-trello-blue rounded p-3">
            <p className="text-xs text-trello">
              ℹ️ There are no other lists to move cards to. Create another list first.
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="move-cards-destination" className="block text-xs font-medium mb-1.5">
            Destination list
          </Label>
          <Select value={targetListId} onValueChange={setTargetListId} disabled={totalListsCount <= 1 || cardsCount === 0}>
            <SelectTrigger id="move-cards-destination">
              <SelectValue placeholder="Select a list..." />
            </SelectTrigger>
            <SelectContent>
              {allLists
                .filter((l) => l.id !== sourceListId)
                .map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {cardsCount > 0 && totalListsCount > 1 && (
            <p className="text-xs text-trello-text-secondary mt-1.5">
              All {cardsCount} card{cardsCount !== 1 ? 's' : ''} will be moved to the selected list in their current order
            </p>
          )}
        </div>

        {cardsCount > 0 && totalListsCount > 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ This action cannot be undone. This list will become empty.
            </p>
          </div>
        )}

        {cardsCount === 0 && (
          <div className="bg-trello-hover border border-trello-border rounded p-3">
            <p className="text-xs text-trello-text-secondary">
              This list has no cards to move.
            </p>
          </div>
        )}

        <Button
          onClick={() => onSubmit(targetListId)}
          disabled={!targetListId || cardsCount === 0 || totalListsCount <= 1}
          className="w-full"
          aria-disabled={!targetListId || cardsCount === 0 || totalListsCount <= 1}
        >
          Move all cards
        </Button>
      </div>
    </div>
  );
};
