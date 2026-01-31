'use client';

import React from 'react';
import { getLabelDisplayColor } from '@/lib/constants/label-colors';

export interface LabelBadgeLabel {
  id: string;
  name?: string | null;
  color?: string | null;
}

export interface LabelBadgeProps {
  label: LabelBadgeLabel;
  /** 'chip' = full chip with name (modal), 'dot' = small colored bar only (card preview) */
  variant?: 'chip' | 'dot';
  /** Click handler (e.g. toggle label). When set, chip is interactive. */
  onClick?: () => void;
  readOnly?: boolean;
  className?: string;
  title?: string;
}

export function LabelBadge({
  label,
  variant = 'chip',
  onClick,
  readOnly = false,
  className = '',
  title,
}: LabelBadgeProps) {
  const displayColor = getLabelDisplayColor(label.color ?? undefined);
  const displayName = label.name || 'Untitled';

  if (variant === 'dot') {
    return (
      <div
        role={onClick && !readOnly ? 'button' : undefined}
        onClick={onClick && !readOnly ? onClick : undefined}
        title={title ?? displayName}
        className={`flex h-2 rounded-sm w-10 shrink-0 ${
          !readOnly && onClick
            ? 'cursor-pointer hover:opacity-90 transition-opacity'
            : ''
        } ${className}`}
        style={{ backgroundColor: displayColor }}
        aria-label={displayName}
      />
    );
  }

  return (
    <span
      role={onClick && !readOnly ? 'button' : undefined}
      onClick={onClick && !readOnly ? onClick : undefined}
      className={`inline-flex items-center justify-center text-xs h-8 px-2 rounded-sm shrink-0 text-white min-w-8 ${
        !readOnly && onClick
          ? 'cursor-pointer hover:opacity-90 transition-opacity'
          : ''
      } ${className}`}
      style={{ backgroundColor: displayColor }}
      title={title ?? displayName}
      aria-label={displayName}
    >
      {displayName}
    </span>
  );
}
