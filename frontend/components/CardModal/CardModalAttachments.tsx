'use client';

import React from 'react';
import { Paperclip } from 'lucide-react';

export interface CardModalAttachmentsProps {
  /** Pièces jointes (à brancher quand l'API existera) */
  attachments?: unknown[];
}

export function CardModalAttachments({ attachments = [] }: CardModalAttachmentsProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="w-5 h-5 text-trello-text-secondary" />
        <h3 className="text-sm font-semibold text-trello">Attachments</h3>
      </div>
      <div className="ml-7">
        {attachments.length === 0 ? (
          <p className="text-sm text-trello-text-secondary">
            Aucune pièce jointe
          </p>
        ) : (
          <div className="space-y-2">
            {/* TODO: afficher la liste des pièces jointes quand l'API sera branchée */}
            {attachments.map((_, i) => (
              <div key={i} className="text-sm text-trello-text-secondary" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
