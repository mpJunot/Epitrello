import React, { useRef, useState } from 'react';
import { useFocusWhen } from '../hooks';
import { MenuHeader } from './MenuCommon';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CopyListMenuProps = {
  defaultName: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export const CopyListMenu: React.FC<CopyListMenuProps> = ({ defaultName, onClose, onSubmit }) => {
  const [listName, setListName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useFocusWhen(true, inputRef as React.RefObject<HTMLElement>, true);

  const handleSubmit = () => {
    const trimmedName = listName.trim();
    if (trimmedName) {
      onSubmit(trimmedName);
    }
  };

  return (
    <div
      className="absolute right-0 top-full mt-1 w-72 bg-trello-card-bg rounded-lg shadow-lg border border-trello-border z-50 animate-slide-down overflow-hidden"
      role="dialog"
      aria-label="Copy list"
    >
      <MenuHeader title="Copy list" onClose={onClose} />

      <div className="p-4 space-y-4">
        <div>
          <Label htmlFor="copy-list-name" className="block text-xs font-medium mb-1.5">
            List name
          </Label>
          <Input
            id="copy-list-name"
            ref={inputRef}
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Enter list name"
            aria-required="true"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!listName.trim()}
          className="w-full"
          aria-disabled={!listName.trim()}
        >
          Create copy
        </Button>
      </div>
    </div>
  );
};
