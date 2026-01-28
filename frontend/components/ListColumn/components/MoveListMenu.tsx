import React, { useState } from 'react';
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
    <div className="space-y-4">
      {totalListsCount <= 1 && (
        <div className="bg-muted border border-accent rounded p-3">
          <p className="text-sm text-muted-foreground">
            There are no other lists to move to. Create another list first.
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="move-list-position" className="block text-sm font-medium mb-2">
          Position
        </Label>
        <Select value={position} onValueChange={setPosition} disabled={totalListsCount <= 1}>
          <SelectTrigger id="move-list-position">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent className="border-accent">
            {Array.from({ length: totalListsCount }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>
                {i + 1} {i === 0 ? '(first)' : i === totalListsCount - 1 ? '(last)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1.5">
          Move this list to the selected position ({totalListsCount} total)
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(parseInt(position, 10))}
          disabled={totalListsCount <= 1}
        >
          Move
        </Button>
      </div>
    </div>
  );
};
