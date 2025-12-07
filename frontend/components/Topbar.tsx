"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();

  if (pathname && pathname.startsWith("/auth")) return null;
  const [query, setQuery] = useState("");
  const [openProfile, setOpenProfile] = useState(false);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search for", query);
  };

  const createBoard = () => {
    const name = window.prompt("Nom du tableau");
    if (!name) return;
    try {
      const raw = localStorage.getItem("epitrello_boards");
      const boards = raw ? JSON.parse(raw) : [];
      const id = crypto?.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const b = { id, title: name, color: "bg-amber-400" };
      const next = [b, ...boards];
      localStorage.setItem("epitrello_boards", JSON.stringify(next));
      window.dispatchEvent(new Event("epitrello:boards-updated"));
      // navigate to new board
      window.location.href = `/dashboard?board=${id}`;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded hover:bg-gray-100">☰</button>
        <form onSubmit={onSearch} className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des cartes, tableaux..."
            className="rounded-md border px-3 py-1 text-sm w-64"
          />
          <button type="submit" className="px-3 py-1 bg-gray-100 rounded">Rechercher</button>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={createBoard} className="px-3 py-1 bg-indigo-600 text-white rounded">Créer</button>
        <button className="p-2 rounded hover:bg-gray-100">🔔</button>
        <div className="relative">
          <button onClick={() => setOpenProfile((s) => !s)} className="flex items-center gap-2 p-1 rounded hover:bg-gray-100">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">U</div>
            <span className="hidden md:inline text-sm">Moi</span>
          </button>
          {openProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow p-2 z-10">
              <a href="/auth/me" className="block px-2 py-1 hover:bg-gray-50">Profil</a>
              <a href="/auth/logout" className="block px-2 py-1 hover:bg-gray-50">Se déconnecter</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
