"use client";

import React, { useEffect, useRef, useState } from "react";
import CardModal from "./CardModal";

// Inline simple types + small label/avatar renderers to avoid module resolution issues
type Label = { id: string; name?: string; color?: string };
type UserRef = { id: string; name?: string; avatar?: string; email?: string };
type Card = {
  id: string;
  title: string;
  description?: string;
  labels?: Label[];
  assignees?: UserRef[];
};

function LabelBadgeInline({ label }: { label: Label }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full text-white ${label.color || 'bg-gray-500'}`}>
      {label.name || ""}
    </span>
  );
}

function MemberAvatarInline({ user, size = 6 }: { user: UserRef; size?: number }) {
  const initials = user.name ? user.name.split(" ").map((s) => s[0]).slice(0,2).join("") : (user.email || "U")[0].toUpperCase();
  const dim = `${size}rem`;
  return (
    <div title={user.name || user.email} className="rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-700" style={{ width: dim, height: dim }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" /> : initials}
    </div>
  );
}

export default function CardItem({
  card,
  listId,
  index,
  onDragStart,
  onDragOver,
}: {
  card: Card;
  listId?: string;
  index?: number;
  onDragStart?: (e: React.DragEvent, cardId: string, fromIndex?: number) => void;
  onDragOver?: (e: React.DragEvent, overIndex?: number) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Log pour debug
  useEffect(() => {
    console.log('🃏 CardItem: card prop changed:', { id: card.id, title: card.title });
  }, [card, card.id, card.title]);

  const handleClick = (e: React.MouseEvent) => {
    // Ne pas ouvrir la modale si on est en train de drag
    if (isDragging) {
      e.preventDefault();
      return;
    }
    setIsModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Prevent dragging temporary cards (not yet created on backend)
    if (card.id.startsWith('temp-')) {
      e.preventDefault();
      return;
    }
    
    setIsDragging(true);
    e.stopPropagation();
    if (onDragStart) {
      onDragStart(e, card.id, index);
    }
    
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    
    // Restore visual state
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
      e.currentTarget.classList.remove("opacity-70", "scale-105");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDragOver) {
      onDragOver(e, index);
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        draggable={!isModalOpen && !card.id.startsWith('temp-')}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        className={`bg-white rounded p-3 shadow-sm hover:shadow-md select-none transition-all duration-200 ${
          card.id.startsWith('temp-') 
            ? 'opacity-60 cursor-not-allowed' 
            : `hover:cursor-pointer ${isDragging ? 'opacity-40 scale-95' : 'hover:scale-[1.02]'}`
        }`}
        onClick={handleClick}
        tabIndex={0}
        title={card.id.startsWith('temp-') ? 'Saving card...' : undefined}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-medium text-base text-gray-900">{card.title}</div>
            {card.description && <div className="text-xs text-gray-600 mt-1">{card.description}</div>}
            <div className="flex gap-2 mt-2 items-center">
              {(card.labels || []).map((l: Label) => (
                <LabelBadgeInline key={l.id} label={l} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {(card.assignees || []).slice(0, 3).map((u: UserRef) => (
              <MemberAvatarInline key={u.id} user={u} size={6} />
            ))}
          </div>
        </div>
      </div>

      {/* Modale de détails de carte */}
      <CardModal
        card={card}
        listId={listId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // Restore focus to the card element
          setTimeout(() => cardRef.current?.focus(), 0);
        }}
      />
    </>
  );
}
