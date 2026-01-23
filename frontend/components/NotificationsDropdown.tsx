"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const loadNotes = () => {
    try {
      const raw = localStorage.getItem('epitrello_notifications');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const [notes, setNotes] = useState<{ id: string; message: string; read?: boolean }[]>(loadNotes);

  const toggleOpen = () => {
    if (!open) {
      setNotes(loadNotes());
    }
    setOpen((s) => !s);
  };

  const markAll = () => {
    const next = notes.map((n) => ({ ...n, read: true }));
    setNotes(next);
    try { localStorage.setItem('epitrello_notifications', JSON.stringify(next)); } catch {}
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={toggleOpen} className="p-2">
        <Bell className="w-5 h-5" />
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-trello-card-bg border border-accent rounded shadow p-3 z-20 text-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Notifications</div>
            <Button onClick={markAll} variant="ghost" size="sm" className="text-xs h-auto p-0">Mark all</Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {notes.length === 0 && <div className="text-trello-secondary">No notifications</div>}
            {notes.map((n) => (
              <div key={n.id} className={`p-2 rounded ${n.read ? 'bg-trello-card-bg' : 'bg-trello-blue-light'}`}>
                <div className="text-sm">{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
