"use client";

import React, { useState } from "react";

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
      <button className="p-2 rounded hover:bg-gray-100" onClick={toggleOpen}>🔔</button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded shadow p-3 z-20 text-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Notifications</div>
            <button onClick={markAll} className="text-xs text-indigo-600">Mark all</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {notes.length === 0 && <div className="text-gray-500">No notifications</div>}
            {notes.map((n) => (
              <div key={n.id} className={`p-2 rounded ${n.read ? 'bg-white' : 'bg-indigo-50'}`}>
                <div className="text-sm">{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
