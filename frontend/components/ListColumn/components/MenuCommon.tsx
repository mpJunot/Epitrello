import React from 'react';

export const CloseIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>
);

export const CheckIcon = () => (
  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 16 16">
    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
  </svg>
);

type MenuHeaderProps = {
  title: string;
  onClose: () => void;
};

export const MenuHeader: React.FC<MenuHeaderProps> = ({ title, onClose }) => (
  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
    <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
    <button
      onClick={onClose}
      className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded transition-colors"
      aria-label={`Close ${title.toLowerCase()} dialog`}
    >
      <CloseIcon />
    </button>
  </div>
);
