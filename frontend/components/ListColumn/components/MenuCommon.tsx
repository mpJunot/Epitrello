import React from 'react';
import { X, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const CloseIcon = () => (
  <X className="w-4 h-4" aria-hidden="true" />
);

export const CheckIcon = () => (
  <Check className="w-4 h-4 text-trello-blue" />
);

type MenuHeaderProps = {
  title: string;
  onClose: () => void;
};

export const MenuHeader: React.FC<MenuHeaderProps> = ({ title, onClose }) => (
  <div className="px-4 py-3 border-b border-accent flex items-center justify-between">
    <h4 className="text-sm font-semibold text-trello">{title}</h4>
    <Button
      onClick={onClose}
      variant="ghost"
      size="icon"
      aria-label={`Close ${title.toLowerCase()} dialog`}
    >
      <CloseIcon />
    </Button>
  </div>
);
