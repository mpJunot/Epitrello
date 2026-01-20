"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import CreateBoardModal from "./CreateBoardModal";

export default function Topbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  const [query, setQuery] = useState("");
  const [openProfile, setOpenProfile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsCount] = useState(() => {
    try {
      const raw = localStorage.getItem("epitrello_notifications");
      const notes = raw ? JSON.parse(raw) : [];
      return Array.isArray(notes) ? notes.length : 0;
    } catch {
      return 0;
    }
  });
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [userName] = useState<string>(() => {
    try {
      const raw = localStorage.getItem('epitrello_user');
      const u = raw ? JSON.parse(raw) : null;
      return u?.name || 'Benjamin Maillot';
    } catch {
      return 'Benjamin Maillot';
    }
  });
  const [userEmail] = useState<string>(() => {
    try {
      const raw = localStorage.getItem('epitrello_user');
      const u = raw ? JSON.parse(raw) : null;
      return u?.email || 'maillotbenjamin1@gmail.com';
    } catch {
      return 'maillotbenjamin1@gmail.com';
    }
  });
  const router = useRouter();

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

  const [createOpen, setCreateOpen] = useState(false);

  const createBoard = (payload?: { name?: string; workspaceId?: string; visibility?: string }) => {
    // If called with payload (from modal), create board; otherwise open modal
    if (!payload) {
      setCreateOpen(true);
      return;
    }

    const { name, workspaceId, visibility } = payload;
    if (!name) return;

    try {
      const backgrounds = [
        'bg-gradient-to-br from-amber-400 to-orange-500',
        'bg-gradient-to-br from-sky-400 to-blue-500',
        'bg-gradient-to-br from-emerald-400 to-green-500',
        'bg-gradient-to-br from-violet-400 to-purple-500',
        'bg-gradient-to-br from-rose-400 to-pink-500',
        'bg-gradient-to-br from-cyan-400 to-teal-500',
      ];

      const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      const raw = localStorage.getItem('epitrello_boards');
      const boards = raw ? JSON.parse(raw) : [];
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : Date.now().toString();
      const board = {
        id,
        name,
        description: undefined,
        background: randomBackground,
        members: 1,
        workspaceId,
        visibility,
      };

      const next = [board, ...boards];
      localStorage.setItem('epitrello_boards', JSON.stringify(next));
      window.dispatchEvent(new Event('epitrello:boards-updated'));

      // navigate to the newly created board page
      router.push(`/boards/${id}`);
    } catch (e) {
      console.error(e);
      alert('Impossible de créer le tableau');
    }
  };

  if (isAuthPage) {
    return null;
  }

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
            onClick={() => createBoard()}
            aria-label="Create a new board"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded"
          >
            + Créer
          </button>
          <button
            onClick={() => createBoard()}
            aria-label="Create board"
            className="sm:hidden p-2 rounded bg-indigo-600 text-white"
            title="Créer"
          >
            +
          </button>
          <CreateBoardModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={(p) => createBoard(p)} />

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
              <div role="menu" aria-label="Menu profil" className="absolute right-0 mt-2 w-64 bg-white border rounded shadow p-3 z-10 text-sm">
                <div className="mb-2">
                  <div className="text-xs text-gray-500 font-medium">Account</div>
                  <div className="mt-2">
                    <div className="font-semibold text-gray-900">{userName}</div>
                    <div className="text-xs text-gray-600">{userEmail}</div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <a role="menuitem" href="#" onClick={(e) => { e.preventDefault(); alert('Switch accounts (not implemented)'); }} className="block px-2 py-1 text-gray-700 hover:bg-gray-50 rounded">Switch accounts</a>
                    <a role="menuitem" href="/settings" className="block px-2 py-1 text-gray-700 hover:bg-gray-50 rounded">Manage account</a>
                  </div>
                </div>

                <div className="border-t my-2" />

                <div className="mb-2">
                  <div className="text-xs text-gray-500 font-medium">Trello</div>
                  <div className="mt-2 space-y-1">
                    <a role="menuitem" href="/auth/me" className="block px-2 py-1 text-gray-700 hover:bg-gray-50 rounded">Profile and visibility</a>
                    <a role="menuitem" href="#" onClick={(e) => { e.preventDefault(); alert('Activity (not implemented)'); }} className="block px-2 py-1 text-gray-700 hover:bg-gray-50 rounded">Activity</a>
                    <a role="menuitem" href="#" onClick={(e) => { e.preventDefault(); alert('Cards (not implemented)'); }} className="block px-2 py-1 text-gray-700 hover:bg-gray-50 rounded">Cards</a>
                    <a role="menuitem" href="/settings" className="block px-2 py-1 text-gray-700 hover:bg-gray-50 rounded">Settings</a>
                  </div>
                </div>

                <div className="border-t my-2" />

                <div className="mb-2">
                  <a role="menuitem" href="#" onClick={(e) => { e.preventDefault(); alert('Help (not implemented)'); }} className="block px-2 py-1 text-gray-700 hover:bg-gray-50 rounded">Help</a>
                </div>

                <div className="border-t my-2" />

                <div>
                  <button
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      // Clear client-side stored user data (client-only logout)
                      try {
                        localStorage.removeItem('epitrello_user');
                        localStorage.removeItem('epitrello_notifications');
                        localStorage.removeItem('epitrello_boards');
                        localStorage.removeItem('epitrello_active_board');
                        localStorage.removeItem('epitrello_workspaces');
                        localStorage.removeItem('epitrello_expanded_workspaces');
                      } catch {}
                      setOpenProfile(false);
                      router.push('/auth/login');
                    }}
                    className="w-full text-left block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    Log out
                  </button>
                </div>
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
