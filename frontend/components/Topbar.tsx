"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import CreateBoardModal from "./CreateBoardModal";
import { toast } from "@/lib/toast";
import { Search, Bell, HelpCircle, Keyboard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchWithAdvancedInput } from "./SearchWithAdvancedInput";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { clearAuthToken } from "@/lib/graphql-client";
import { getCurrentUser } from "@/lib/actions/users";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Topbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; read?: boolean }>>(() => {
    try {
      const raw = localStorage.getItem("epitrello_notifications");
      const notes = raw ? JSON.parse(raw) : [];
      return Array.isArray(notes) ? notes : [];
    } catch {
      return [];
    }
  });

  const notificationsCount = notifications.filter(n => !n.read).length;
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserName(user.name || '');
          setUserEmail(user.email || '');
          setUserAvatar(user.avatar);
        }
      } catch (error) {
        console.error('Failed to load user in Topbar', error);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const raw = localStorage.getItem("epitrello_notifications");
        const notes = raw ? JSON.parse(raw) : [];
        if (Array.isArray(notes)) {
          setNotifications((prevNotifications) => {
            const previousUnread = prevNotifications.filter(n => !n.read).length;
            const newUnread = notes.filter((n: { read?: boolean }) => !n.read).length;
            if (newUnread > previousUnread) {
              const newNotifications = notes.filter((n: { read?: boolean; id: string; message: string }) =>
                !n.read && !prevNotifications.find(existing => existing.id === n.id)
              );
              newNotifications.forEach((notification: { message: string }) => {
                toast.info(notification.message, 'Notification');
              });
            }

            return notes;
          });
        }
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('epitrello:notification-added', handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('epitrello:notification-added', handleStorageChange);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('epitrello_user');
      localStorage.removeItem('epitrello_notifications');
      localStorage.removeItem('epitrello_boards');
      localStorage.removeItem('epitrello_active_board');
      localStorage.removeItem('epitrello_workspaces');
      localStorage.removeItem('epitrello_expanded_workspaces');
      clearAuthToken();  // ← Nettoie localStorage et le cookie

      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      console.error('Failed to sign out', error);
      router.push('/auth/login');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const onSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("Search for", query);
    setSearchOpen(false);
  };

  const [createOpen, setCreateOpen] = useState(false);

  const createBoard = (payload?: { name?: string; workspaceId?: string; visibility?: string; background?: string }) => {
    if (!payload) {
      setCreateOpen(true);
      return;
    }

    const { name, workspaceId, visibility, background } = payload;
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

      const selectedBackground = background || backgrounds[Math.floor(Math.random() * backgrounds.length)];

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
        background: selectedBackground,
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
          {/* Desktop search with keyboard navigation */}
          <SearchWithAdvancedInput />
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
            onClick={() => {
              const unreadNotifications = notifications.filter(n => !n.read);
              if (unreadNotifications.length === 0) {
                toast.info('No new notifications');
                return;
              }

              unreadNotifications.forEach((notification) => {
                toast.info(notification.message);
              });

              const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
              setNotifications(updatedNotifications);
              try {
                localStorage.setItem('epitrello_notifications', JSON.stringify(updatedNotifications));
              } catch (error) {
                console.error('Failed to update notifications', error);
              }
            }}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="shrink-0 h-auto p-1"
                aria-label="Open profile menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userName ? getInitials(userName) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 border-accent">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail || ''}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <div className="text-xs text-muted-foreground font-medium mb-2">Account</div>
                <div className="space-y-1">
                  <DropdownMenuItem asChild>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Switch accounts (not implemented)'); }} className="cursor-pointer">
                      Switch accounts
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/settings" className="cursor-pointer">
                      Manage account
                    </a>
                  </DropdownMenuItem>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <div className="text-xs text-muted-foreground font-medium mb-2">Trello</div>
                <div className="space-y-1">
                  <DropdownMenuItem asChild>
                    <a href="/profile" className="cursor-pointer">
                      Profile and visibility
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/activity" className="cursor-pointer">
                      Activity
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/cards" className="cursor-pointer">
                      Cards
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/settings" className="cursor-pointer">
                      Settings
                    </a>
                  </DropdownMenuItem>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <DropdownMenuItem asChild>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowHelpDialog(true); }} className="cursor-pointer">
                    Help
                  </a>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Centre d'aide Epitrello
            </DialogTitle>
            <DialogDescription>
              Découvrez comment utiliser Epitrello pour organiser vos projets efficacement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Getting Started */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Démarrage rapide
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                <li className="list-disc">Créez un <strong>workspace</strong> pour organiser vos projets par équipe ou domaine</li>
                <li className="list-disc">Ajoutez des <strong>boards</strong> pour chaque projet dans votre workspace</li>
                <li className="list-disc">Utilisez les <strong>listes</strong> pour représenter les étapes de votre workflow (À faire, En cours, Terminé)</li>
                <li className="list-disc">Créez des <strong>cartes</strong> pour chaque tâche et faites-les glisser entre les listes</li>
              </ul>
            </div>

            <Separator />

            {/* Key Features */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold">Fonctionnalités clés</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-foreground">Cartes interactives</strong>
                  <p className="text-muted-foreground">Ajoutez des descriptions, des checklists, des labels et des dates d'échéance à vos cartes.</p>
                </div>
                <div>
                  <strong className="text-foreground">Collaboration en équipe</strong>
                  <p className="text-muted-foreground">Invitez des membres, assignez des tâches et commentez les cartes pour collaborer.</p>
                </div>
                <div>
                  <strong className="text-foreground">Personnalisation</strong>
                  <p className="text-muted-foreground">Choisissez des arrière-plans pour vos boards et organisez-les selon vos préférences.</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Keyboard Shortcuts */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Raccourcis clavier
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Nouvelle carte</span>
                  <kbd className="px-2 py-1 text-xs bg-background border rounded">N</kbd>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Recherche</span>
                  <kbd className="px-2 py-1 text-xs bg-background border rounded">Ctrl+F</kbd>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Nouveau board</span>
                  <kbd className="px-2 py-1 text-xs bg-background border rounded">B</kbd>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Aide</span>
                  <kbd className="px-2 py-1 text-xs bg-background border rounded">?</kbd>
                </div>
              </div>
            </div>

            <Separator />

            {/* Support */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold">Besoin d'aide supplémentaire ?</h3>
              <p className="text-sm text-muted-foreground">
                Consultez la documentation complète ou contactez le support pour plus d'informations.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.info('Documentation à venir')}>
                  Documentation
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.info('Support à venir')}>
                  Contacter le support
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
