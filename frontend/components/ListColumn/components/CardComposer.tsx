import React, { useRef, useState } from 'react';
import { useFocusWhen } from '../hooks';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
      <Textarea
        ref={textareaRef}
        placeholder="Enter a title for this card"
        value={cardText}
        onChange={(e) => {
          setCardText(e.target.value);
          if (cardError) setCardError(false);
        }}
        onKeyDown={handleKeyDown}
        className={`min-h-[64px] ${
          cardError ? 'border-red-400 bg-red-50' : ''
        }`}
      />
      {cardError && (
        <p className="text-xs text-red-600 mt-1">Card title is required</p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <Button
          onClick={handleSubmit}
          size="sm"
        >
          Add card
        </Button>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="icon"
          aria-label="Cancel add card"
        >
          ✕
        </Button>
      </div>
    </div>
  );
};
