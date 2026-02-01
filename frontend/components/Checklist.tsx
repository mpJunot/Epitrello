"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
    <div className="p-3 bg-trello-hover rounded">
      {title && <div className="font-medium mb-2 text-trello">{title}</div>}
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2">
            <Checkbox checked={!!it.checked} onCheckedChange={() => toggle(it.id)} />
            <Label className={`text-sm cursor-pointer ${it.checked ? 'line-through text-trello-text-secondary' : 'text-trello'}`}>
              {it.content}
            </Label>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <Button onClick={addItem} variant="ghost" size="sm">+ Add item</Button>
      </div>
    </div>
  );
}
