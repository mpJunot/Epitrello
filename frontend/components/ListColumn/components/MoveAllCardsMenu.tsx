import React, { useState } from 'react';
import { MenuHeader } from './MenuCommon';
import { List } from '../types';

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
    <div
      className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-down overflow-hidden"
      role="dialog"
      aria-label="Move all cards"
    >
      <MenuHeader title="Move all cards" onClose={onClose} />

      <div className="p-4 space-y-4">
        {totalListsCount <= 1 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              ℹ️ There are no other lists to move cards to. Create another list first.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="move-cards-destination" className="block text-xs font-medium text-gray-700 mb-1.5">
            Destination list
          </label>
          <select
            id="move-cards-destination"
            value={targetListId}
            onChange={(e) => setTargetListId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            disabled={totalListsCount <= 1 || cardsCount === 0}
            aria-disabled={totalListsCount <= 1 || cardsCount === 0}
            aria-required="true"
          >
            <option value="">Select a list...</option>
            {allLists
              .filter((l) => l.id !== sourceListId)
              .map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
          </select>
          {cardsCount > 0 && totalListsCount > 1 && (
            <p className="text-xs text-gray-500 mt-1.5">
              All {cardsCount} card{cardsCount !== 1 ? 's' : ''} will be moved to the selected list in their current order
            </p>
          )}
        </div>

        {cardsCount > 0 && totalListsCount > 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <p className="text-xs text-amber-800">
              ⚠️ This action cannot be undone. This list will become empty.
            </p>
          </div>
        )}

        {cardsCount === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-xs text-gray-600">
              This list has no cards to move.
            </p>
          </div>
        )}

        <button
          onClick={() => onSubmit(targetListId)}
          disabled={!targetListId || cardsCount === 0 || totalListsCount <= 1}
          className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          aria-disabled={!targetListId || cardsCount === 0 || totalListsCount <= 1}
        >
          Move all cards
        </button>
      </div>
    </div>
  );
};
