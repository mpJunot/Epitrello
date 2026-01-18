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
    setIsDragging(true);
    if (onDragStart) {
      onDragStart(e, card.id, index);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    // cleanup any inline drag styles if present
    const el = e.currentTarget as HTMLElement;
    el.classList.remove("opacity-70", "scale-105");
  };

  return (
    <>
      <div
        ref={cardRef}
        draggable={!isModalOpen}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver && onDragOver(e, index);
        }}
        className="bg-white rounded p-3 shadow-sm hover:shadow-md hover:cursor-pointer select-none transition-all duration-200 hover:scale-[1.02]"
        onClick={handleClick}
        tabIndex={0}
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
