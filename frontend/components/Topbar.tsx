"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import CreateBoardModal from "./CreateBoardModal";
import { toast } from "@/lib/toast";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
    console.log("Search for", query);
    setSearchOpen(false);
  };

  const [createOpen, setCreateOpen] = useState(false);

  const createBoard = (payload?: { name?: string; workspaceId?: string; visibility?: string }) => {
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

      router.push(`/boards/${id}`);
    } catch (e) {
      console.error(e);
      toast.error('Unable to create board');
    }
  };

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="w-full bg-card border-b border-sidebar-border shrink-0">
      <div className="w-full px-4 py-2 flex items-center justify-between gap-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <SidebarTrigger className="shrink-0" />

          <a href="/dashboard" className="flex items-center gap-2 no-underline shrink-0">
            <div className="h-8 w-8 rounded flex items-center justify-center bg-primary text-primary-foreground font-bold shrink-0">E</div>
            <span className="hidden sm:inline font-semibold text-foreground whitespace-nowrap">Epitrello</span>
          </a>

          {/* Desktop search */}
          <form onSubmit={onSearch} className="hidden lg:flex items-center gap-2 ml-4 min-w-0 flex-1 max-w-md">
            <label htmlFor="global-search" className="sr-only">Global search</label>
            <Input
              id="global-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cards, boards, members..."
              className="w-full min-w-0"
            />
            <Button aria-label="Search" type="submit" variant="secondary" className="shrink-0">Search</Button>
          </form>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile search toggle */}
          <div className="md:hidden">
            <Button
              aria-expanded={searchOpen}
              aria-label="Search"
              onClick={() => setSearchOpen((s) => !s)}
              variant="ghost"
              size="icon"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Create board */}
          <Button
            onClick={() => createBoard()}
            aria-label="Create a new board"
            className="hidden sm:inline-flex shrink-0"
          >
            + Create
          </Button>
          <Button
            onClick={() => createBoard()}
            aria-label="Create board"
            size="icon"
            className="sm:hidden shrink-0"
            title="Create"
          >
            +
          </Button>
          <CreateBoardModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={(p) => createBoard(p)} />

          {/* Notifications */}
          <Button
            aria-label={`Notifications, ${notificationsCount} unread`}
            variant="ghost"
            size="icon"
            title="Notifications"
            onClick={() => alert('Open notifications panel (to be implemented)')}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {notificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full">{notificationsCount}</span>
            )}
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile menu */}
          <div className="relative" ref={profileRef}>
            <Button
              onClick={() => setOpenProfile((s) => !s)}
              aria-haspopup="menu"
              aria-expanded={openProfile}
              aria-label="Open profile menu"
              variant="ghost"
              className="flex items-center gap-2 shrink-0"
            >
              <div className="h-8 w-8 rounded-full bg-border flex items-center justify-center shrink-0">U</div>
              <span className="hidden lg:inline text-sm text-muted-foreground whitespace-nowrap">My account</span>
            </Button>

            {openProfile && (
              <div role="menu" aria-label="Profile menu" className="absolute right-0 mt-2 w-64 bg-card border border-border rounded shadow p-3 z-10 text-sm">
                <div className="mb-2">
                  <div className="text-xs text-muted-foreground font-medium">Account</div>
                  <div className="mt-2">
                    <div className="font-semibold text-foreground">{userName}</div>
                    <div className="text-xs text-muted-foreground">{userEmail}</div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <a role="menuitem" href="#" onClick={(e) => { e.preventDefault(); alert('Switch accounts (not implemented)'); }} className="block px-2 py-1 text-muted-foreground hover:bg-muted rounded">Switch accounts</a>
                    <a role="menuitem" href="/settings" className="block px-2 py-1 text-muted-foreground hover:bg-muted rounded">Manage account</a>
                  </div>
                </div>

                <div className="border-t my-2" />

                <div className="mb-2">
                  <div className="text-xs text-muted-foreground font-medium">Trello</div>
                  <div className="mt-2 space-y-1">
                    <a role="menuitem" href="/auth/me" className="block px-2 py-1 text-muted-foreground hover:bg-muted rounded">Profile and visibility</a>
                    <a role="menuitem" href="#" onClick={(e) => { e.preventDefault(); alert('Activity (not implemented)'); }} className="block px-2 py-1 text-muted-foreground hover:bg-muted rounded">Activity</a>
                    <a role="menuitem" href="#" onClick={(e) => { e.preventDefault(); alert('Cards (not implemented)'); }} className="block px-2 py-1 text-muted-foreground hover:bg-muted rounded">Cards</a>
                    <a role="menuitem" href="/settings" className="block px-2 py-1 text-muted-foreground hover:bg-muted rounded">Settings</a>
                  </div>
                </div>

                <div className="border-t my-2" />

                <div className="mb-2">
                  <a role="menuitem" href="#" onClick={(e) => { e.preventDefault(); alert('Help (not implemented)'); }} className="block px-2 py-1 text-muted-foreground hover:bg-muted rounded">Help</a>
                </div>

                <div className="border-t my-2" />

                <div>
                  <Button
                    role="menuitem"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
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
                    className="w-full justify-start"
                  >
                    Log out
                  </Button>
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
            <label htmlFor="mobile-search" className="sr-only">Search</label>
            <Input
              id="mobile-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full"
            />
            <Button aria-label="Search" type="submit" variant="secondary">OK</Button>
          </form>
        </div>
      )}
    </header>
  );
}
