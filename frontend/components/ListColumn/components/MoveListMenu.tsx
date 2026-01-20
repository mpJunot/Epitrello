import React, { useState } from 'react';
import { MenuHeader } from './MenuCommon';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type MoveListMenuProps = {
  totalListsCount: number;
  onClose: () => void;
  onSubmit: (position: number) => void;
};

export const MoveListMenu: React.FC<MoveListMenuProps> = ({
  totalListsCount,
  onClose,
  onSubmit
}) => {
  const [position, setPosition] = useState("0");

  return (
    <div
      className="absolute right-0 top-full mt-1 w-72 bg-trello-card-bg rounded-lg shadow-lg border border-trello-border z-50 animate-slide-down overflow-hidden"
      role="dialog"
      aria-label="Move list"
    >
      <MenuHeader title="Move list" onClose={onClose} />

      <div className="p-4 space-y-4">
        {totalListsCount <= 1 && (
          <div className="bg-trello-blue-light border border-trello-blue rounded p-3">
            <p className="text-xs text-trello">
              ℹThere are no other lists to move to. Create another list first.
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="move-list-board" className="block text-xs font-medium mb-1.5">
            Board
          </Label>
          <Select defaultValue="current" disabled={totalListsCount <= 1}>
            <SelectTrigger id="move-list-board">
              <SelectValue placeholder="Current board" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current board</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="move-list-position" className="block text-xs font-medium mb-1.5">
            Position
          </Label>
          <Select value={position} onValueChange={setPosition} disabled={totalListsCount <= 1}>
            <SelectTrigger id="move-list-position">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalListsCount }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {i + 1} {i === 0 ? '(first)' : i === totalListsCount - 1 ? '(last)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            <p className="text-xs text-trello-text-secondary mt-1.5">
            Move this list to the selected position ({totalListsCount} total)
          </p>
        </div>

        <Button
          onClick={() => onSubmit(parseInt(position, 10))}
          disabled={totalListsCount <= 1}
          className="w-full"
        >
          Move
        </Button>
      </div>
    </div>
  );
};
