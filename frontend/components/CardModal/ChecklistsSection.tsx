import React from "react";
import { Checklist } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as LabelUI } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Trash2, Plus } from "lucide-react";

interface ChecklistsSectionProps {
  checklists: Checklist[];
  addingItemToChecklist: string | null;
  newItemText: string;
  onDeleteChecklist: (id: string) => void;
  onToggleItem: (checklistId: string, itemId: string) => void;
  onStartAddItem: (checklistId: string) => void;
  onAddItem: (checklistId: string) => void;
  onCancelAddItem: () => void;
  onChangeNewItemText: (v: string) => void;
  getProgress: (checklist: Checklist) => number;
}

export default function ChecklistsSection({
  checklists,
  addingItemToChecklist,
  newItemText,
  onDeleteChecklist,
  onToggleItem,
  onStartAddItem,
  onAddItem,
  onCancelAddItem,
  onChangeNewItemText,
  getProgress,
}: ChecklistsSectionProps) {
  return (
    <>
      {checklists.map((checklist) => {
        const progress = getProgress(checklist);
        const checkedCount = checklist.items.filter((item) => item.checked).length;
        return (
          <div key={checklist.id}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-trello-text-secondary" />
                <h3 className="text-sm font-semibold text-trello">{checklist.title}</h3>
              </div>
              <Button onClick={() => onDeleteChecklist(checklist.id)} variant="ghost" size="icon" className="text-trello-text-secondary hover:text-red-600" title="Delete checklist">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="ml-7">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-trello-text-secondary">{checkedCount}/{checklist.items.length}</span>
                  <span className="text-xs font-semibold text-trello">{progress}%</span>
                </div>
                <div className="w-full bg-trello-border rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${progress === 100 ? "bg-green-500" : "bg-trello-blue"}`} style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                {checklist.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 p-2 rounded hover:bg-trello-hover group transition-colors">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => onToggleItem(checklist.id, item.id)}
                      className="mt-0.5"
                    />
                    <LabelUI className={`text-sm flex-1 cursor-pointer ${item.checked ? "text-trello-text-secondary line-through" : "text-trello"}`}>
                      {item.text}
                    </LabelUI>
                  </div>
                ))}
              </div>

              {addingItemToChecklist === checklist.id ? (
                <div className="mt-3">
                  <Input
                    type="text"
                    value={newItemText}
                    onChange={(e) => onChangeNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onAddItem(checklist.id);
                      } else if (e.key === "Escape") {
                        onCancelAddItem();
                      }
                    }}
                    placeholder="Add an item..."
                    className="mb-2"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button onClick={() => onAddItem(checklist.id)} size="sm">
                      Add
                    </Button>
                    <Button onClick={onCancelAddItem} variant="secondary" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => onStartAddItem(checklist.id)} variant="ghost" size="sm" className="mt-2">
                  <Plus className="w-4 h-4" />
                  Add an item
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
