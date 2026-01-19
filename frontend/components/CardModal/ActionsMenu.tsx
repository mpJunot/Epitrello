import React from "react";

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
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Actions</h3>
      <div className="space-y-2">
        <div className="relative">
          <button onClick={onToggleMove} className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            Move
          </button>
          {showMoveMenu && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10 animate-fade-in">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Select a list</h4>
              <div className="space-y-1">
                {["To Do", "In Progress", "Review", "Done"].map((listName) => (
                  <button key={listName} onClick={() => onMoveCardToList(listName)} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
                    {listName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={onCopyCard} className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          Copy
        </button>

        <button onClick={onRequestArchive} className="w-full text-left text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          Archive
        </button>

        <button onClick={onRequestDelete} className="w-full text-left text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Delete
        </button>
      </div>
    </div>
  );
}
