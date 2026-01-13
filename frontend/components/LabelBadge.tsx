"use client";

import React from "react";

export default function LabelBadge({ label }: { label: { id: string; name?: string; color?: string } }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full text-white ${label.color || 'bg-gray-500'}`}>
      {label.name || ""}
    </span>
  );
}
