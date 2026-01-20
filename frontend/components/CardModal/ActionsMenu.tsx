import React from "react";
import { Button } from "@/components/ui/button";
import { Move, Copy, Archive, Trash2 } from "lucide-react";

interface ActionsMenuProps {
  showMoveMenu: boolean;
  onToggleMove: () => void;
  onMoveCardToList: (listName: string) => void;
  onCopyCard: () => void;
  onRequestArchive: () => void;
  onRequestDelete: () => void;
}

export default function ActionsMenu({
  showMoveMenu,
  onToggleMove,
  onMoveCardToList,
  onCopyCard,
  onRequestArchive,
  onRequestDelete,
}: ActionsMenuProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-trello-text-secondary uppercase tracking-wide mb-2">Actions</h3>
      <div className="space-y-2">
        <div className="relative">
          <Button onClick={onToggleMove} variant="ghost" className="w-full justify-start">
            <Move className="w-4 h-4" />
            Move
          </Button>
          {showMoveMenu && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-trello-card-bg rounded-lg shadow-xl border border-trello-border p-3 z-10 animate-fade-in">
              <h4 className="text-sm font-semibold text-trello mb-2">Select a list</h4>
              <div className="space-y-1">
                {["To Do", "In Progress", "Review", "Done"].map((listName) => (
                  <Button key={listName} onClick={() => onMoveCardToList(listName)} variant="ghost" className="w-full justify-start">
                    {listName}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button onClick={onCopyCard} variant="ghost" className="w-full justify-start">
          <Copy className="w-4 h-4" />
          Copy
        </Button>

        <Button onClick={onRequestArchive} variant="ghost" className="w-full justify-start">
          <Archive className="w-4 h-4" />
          Archive
        </Button>

        <Button onClick={onRequestDelete} variant="destructive" className="w-full justify-start">
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
