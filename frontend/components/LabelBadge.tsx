"use client";

import React from "react";
import { getLabelDisplayColor } from "@/lib/constants/label-colors";

export default function LabelBadge({ label }: { label: { id: string; name?: string; color?: string } }) {
  return (
    <span
      className="inline-block text-xs px-2 py-0.5 rounded-full text-white"
      style={{ backgroundColor: getLabelDisplayColor(label.color) }}
    >
      {label.name || ""}
    </span>
  );
}
