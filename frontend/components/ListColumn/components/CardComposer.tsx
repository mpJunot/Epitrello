import React, { useRef, useState } from 'react';
import { useFocusWhen } from '../hooks';

type CardComposerProps = {
  onSubmit: (title: string) => void;
  onCancel: () => void;
};

export const CardComposer: React.FC<CardComposerProps> = ({ onSubmit, onCancel }) => {
  const [cardText, setCardText] = useState("");
  const [cardError, setCardError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useFocusWhen(true, textareaRef as React.RefObject<HTMLElement>);

  const handleSubmit = () => {
    const trimmedTitle = cardText.trim();
    if (!trimmedTitle) {
      setCardError(true);
      setTimeout(() => setCardError(false), 500);
      return;
    }
    
    onSubmit(trimmedTitle);
    setCardText("");
    setCardError(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className={cardError ? 'animate-shake' : ''}>
      <textarea
        ref={textareaRef}
        placeholder="Enter a title for this card"
        value={cardText}
        onChange={(e) => {
          setCardText(e.target.value);
          if (cardError) setCardError(false);
        }}
        onKeyDown={handleKeyDown}
        className={`w-full min-h-[64px] p-2 rounded border ${
          cardError ? 'border-red-400 bg-red-50' : 'border-gray-200'
        } text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors`}
      />
      {cardError && (
        <p className="text-xs text-red-600 mt-1">Le titre de la carte est requis</p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={handleSubmit}
          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 active:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
        >
          Add card
        </button>
        <button
          onClick={onCancel}
          className="px-2 py-1 text-sm text-gray-600 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Cancel add card"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
