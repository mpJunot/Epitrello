import React from "react";
import { Checklist } from "./types";

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
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-700">{checklist.title}</h3>
              </div>
              <button onClick={() => onDeleteChecklist(checklist.id)} className="text-sm text-gray-500 hover:text-red-600 transition-colors" title="Delete checklist">
                Delete
              </button>
            </div>
            <div className="ml-7">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{checkedCount}/{checklist.items.length}</span>
                  <span className="text-xs font-semibold text-gray-700">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${progress === 100 ? "bg-green-500" : "bg-indigo-500"}`} style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                {checklist.items.map((item) => (
                  <label key={item.id} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer group transition-colors">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => onToggleItem(checklist.id, item.id)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className={`text-sm flex-1 ${item.checked ? "text-gray-400 line-through" : "text-gray-700"}`}>{item.text}</span>
                  </label>
                ))}
              </div>

              {addingItemToChecklist === checklist.id ? (
                <div className="mt-3">
                  <input
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button onClick={() => onAddItem(checklist.id)} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors">
                      Add
                    </button>
                    <button onClick={onCancelAddItem} className="px-3 py-1.5 text-sm text-gray-600 rounded hover:bg-gray-100 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => onStartAddItem(checklist.id)} className="mt-2 text-sm text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded transition-colors">
                  + Add an item
                </button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
