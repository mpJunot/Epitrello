import React, { useState } from 'react';
import { MenuHeader } from './MenuCommon';

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
      className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-down overflow-hidden"
      role="dialog"
      aria-label="Move list"
    >
      <MenuHeader title="Move list" onClose={onClose} />

      <div className="p-4 space-y-4">
        {totalListsCount <= 1 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              ℹ️ There are no other lists to move to. Create another list first.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="move-list-board" className="block text-xs font-medium text-gray-700 mb-1.5">
            Board
          </label>
          <select
            id="move-list-board"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            defaultValue="current"
            disabled={totalListsCount <= 1}
            aria-disabled={totalListsCount <= 1}
          >
            <option value="current">Current board</option>
          </select>
        </div>

        <div>
          <label htmlFor="move-list-position" className="block text-xs font-medium text-gray-700 mb-1.5">
            Position
          </label>
          <select
            id="move-list-position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            disabled={totalListsCount <= 1}
            aria-disabled={totalListsCount <= 1}
          >
            {Array.from({ length: totalListsCount }, (_, i) => (
              <option key={i} value={i.toString()}>
                {i + 1} {i === 0 ? '(first)' : i === totalListsCount - 1 ? '(last)' : ''}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1.5">
            Move this list to the selected position ({totalListsCount} total)
          </p>
        </div>

        <button
          onClick={() => onSubmit(parseInt(position, 10))}
          disabled={totalListsCount <= 1}
          className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          aria-disabled={totalListsCount <= 1}
        >
          Move
        </button>
      </div>
    </div>
  );
};
