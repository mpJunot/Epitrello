"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();

  // hide on auth pages
  if (pathname && pathname.startsWith("/auth")) return null;

  const [query, setQuery] = useState("");
  const [openProfile, setOpenProfile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("epitrello_notifications");
      const notes = raw ? JSON.parse(raw) : [];
      setNotificationsCount(Array.isArray(notes) ? notes.length : 0);
    } catch (e) {
      setNotificationsCount(0);
    }
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        profileRef.current &&
        e.target instanceof Node &&
        !profileRef.current.contains(e.target)
      ) {
        setOpenProfile(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const onSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // simple client-side emit; integrate with search route later
    console.log("Search for", query);
    setSearchOpen(false);
  };

  const createBoard = () => {
    const name = window.prompt("Board name");
    if (!name) return;
    try {
      const raw = localStorage.getItem("epitrello_boards");
      const boards = raw ? JSON.parse(raw) : [];
      const id = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : Date.now().toString();
      const b = { id, title: name, color: "bg-amber-400" };
      const next = [b, ...boards];
      localStorage.setItem("epitrello_boards", JSON.stringify(next));
      window.dispatchEvent(new Event("epitrello:boards-updated"));
      // navigate to new board
      window.location.href = `/dashboard?board=${id}`;
    } catch (e) {
      console.error(e);
      alert("Unable to create board");
    }
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* mobile menu button - purely visual/hook for later */}
          <button aria-label="Ouvrir le menu" className="md:hidden p-2 rounded hover:bg-gray-100">☰</button>

          {/* Logo / title */}
          <a href="/dashboard" className="flex items-center gap-2 no-underline">
            <div className="h-8 w-8 rounded flex items-center justify-center bg-indigo-600 text-white font-bold">E</div>
            <span className="hidden sm:inline font-semibold text-gray-800">Epitrello</span>
          </a>

          {/* Desktop search */}
          <form onSubmit={onSearch} className="hidden md:flex items-center gap-2 ml-4">
            <label htmlFor="global-search" className="sr-only">Recherche globale</label>
            <input
              id="global-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cards, boards, members..."
              className="rounded-md border px-3 py-1 text-sm w-72"
            />
            <button aria-label="Search" type="submit" className="px-3 py-1 bg-gray-100 text-gray-700 rounded">Search</button>
          </form>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          <div className="md:hidden">
            <button
              aria-expanded={searchOpen}
              aria-label="Recherche"
              onClick={() => setSearchOpen((s) => !s)}
              className="p-2 rounded hover:bg-gray-100"
            >
              🔍
            </button>
          </div>

          {/* Create board */}
          <button
            onClick={createBoard}
            aria-label="Create a new board"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded"
          >
            + Créer
          </button>
          <button
            onClick={createBoard}
            aria-label="Create board"
            className="sm:hidden p-2 rounded bg-indigo-600 text-white"
            title="Créer"
          >
            +
          </button>

          {/* Notifications */}
          <button
            aria-label={`Notifications, ${notificationsCount} non lues`}
            className="relative p-2 rounded hover:bg-gray-100"
            title="Notifications"
            onClick={() => alert('Ouvrir le panneau de notifications (à implémenter)')}
          >
            🔔
            {notificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full">{notificationsCount}</span>
            )}
          </button>

          {/* Profile menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setOpenProfile((s) => !s)}
              aria-haspopup="menu"
              aria-expanded={openProfile}
              aria-label="Ouvrir le menu de profil"
              className="flex items-center gap-2 p-1 rounded hover:bg-gray-100"
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">U</div>
              <span className="hidden md:inline text-sm text-gray-700">My account</span>
            </button>

            {openProfile && (
              <div role="menu" aria-label="Menu profil" className="absolute right-0 mt-2 w-56 bg-white border rounded shadow p-2 z-10">
                <a role="menuitem" href="/auth/me" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Profile and settings</a>
                <a role="menuitem" href="/settings" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Account settings</a>
                <a role="menuitem" href="/auth/logout" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Sign out</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-2">
          <form onSubmit={onSearch} className="flex items-center gap-2">
            <label htmlFor="mobile-search" className="sr-only">Recherche</label>
            <input
              id="mobile-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border px-3 py-2"
            />
            <button aria-label="Lancer la recherche" type="submit" className="px-3 py-2 bg-gray-100 text-gray-700 rounded">OK</button>
          </form>
        </div>
      )}
    </header>
  );
}
