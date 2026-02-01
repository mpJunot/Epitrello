import React, { useRef, useState, useEffect } from 'react';
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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = () => {
    const trimmedName = listName.trim();
    if (trimmedName) {
      onSubmit(trimmedName);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="copy-list-name" className="block text-sm font-medium mb-2">
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
            } else if (e.key === 'Escape') {
              onClose();
            }
          }}
          placeholder="Enter list name"
          aria-required="true"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!listName.trim()}
          aria-disabled={!listName.trim()}
        >
          Create copy
        </Button>
      </div>
    </div>
  );
};
