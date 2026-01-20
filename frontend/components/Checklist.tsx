"use client";

import React, { useState } from "react";

export default function Checklist({ title, items: initial }: { title?: string; items?: { id: string; content: string; checked?: boolean }[] }) {
  const [items, setItems] = useState(initial || []);

  const toggle = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)));
  };

  const addItem = () => {
    const content = window.prompt("Checklist item");
    if (!content) return;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Date.now().toString();
    setItems((p) => [...p, { id, content, checked: false }]);
  };

  return (
    <div className="p-3 bg-gray-50 rounded">
      {title && <div className="font-medium mb-2">{title}</div>}
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2">
            <input type="checkbox" checked={!!it.checked} onChange={() => toggle(it.id)} />
            <div className={`text-sm ${it.checked ? 'line-through text-gray-400' : ''}`}>{it.content}</div>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <button onClick={addItem} className="text-sm text-indigo-600 hover:underline">+ Add item</button>
      </div>
    </div>
  );
}
