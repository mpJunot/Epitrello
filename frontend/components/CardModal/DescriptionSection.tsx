import React from "react";

interface DescriptionSectionProps {
  cardDescription?: string;
  isEditing: boolean;
  description: string;
  onChange: (v: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function DescriptionSection({
  cardDescription,
  isEditing,
  description,
  onChange,
  onStartEdit,
  onSave,
  onCancel,
  textareaRef,
}: DescriptionSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-700">Description</h3>
      </div>
      <div className="ml-7">
        {!isEditing ? (
          <div onClick={onStartEdit} className="cursor-pointer">
            {cardDescription ? (
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded transition-colors min-h-[80px]">
                {cardDescription}
              </p>
            ) : (
              <button className="text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors w-full text-left min-h-[80px]">
                Add a more detailed description...
              </button>
            )}
          </div>
        ) : (
          <div>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  onCancel();
                }
              }}
              placeholder="Add a more detailed description..."
              className="w-full min-h-[120px] p-3 rounded border-2 border-indigo-500 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={onSave}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 active:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
              >
                Save
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm text-gray-600 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
