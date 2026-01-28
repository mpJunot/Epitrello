import React, { useState } from 'react';
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
    <div className="space-y-4">
      {totalListsCount <= 1 && (
        <div className="bg-muted border border-accent rounded p-3">
          <p className="text-sm text-muted-foreground">
            There are no other lists to move cards to. Create another list first.
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="move-cards-destination" className="block text-sm font-medium mb-2">
          Destination list
        </Label>
        <Select value={targetListId} onValueChange={setTargetListId} disabled={totalListsCount <= 1 || cardsCount === 0}>
          <SelectTrigger id="move-cards-destination">
            <SelectValue placeholder="Select a list..." />
          </SelectTrigger>
          <SelectContent className="border-accent">
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
          <p className="text-xs text-muted-foreground mt-1.5">
            All {cardsCount} card{cardsCount !== 1 ? 's' : ''} will be moved to the selected list in their current order
          </p>
        )}
      </div>

      {cardsCount > 0 && totalListsCount > 1 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ This action cannot be undone. This list will become empty.
          </p>
        </div>
      )}

      {cardsCount === 0 && (
        <div className="bg-muted border border-accent rounded p-3">
          <p className="text-sm text-muted-foreground">
            This list has no cards to move.
          </p>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(targetListId)}
          disabled={!targetListId || cardsCount === 0 || totalListsCount <= 1}
          aria-disabled={!targetListId || cardsCount === 0 || totalListsCount <= 1}
        >
          Move all cards
        </Button>
      </div>
    </div>
  );
};
