'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import CreateBoardModal from './CreateBoardModal';
import { toast } from '@/lib/toast';
import { Search, Bell, HelpCircle, Keyboard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SearchWithAdvancedInput } from './SearchWithAdvancedInput';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  clearAuthToken,
  clearEpitrelloLocalStorage,
} from '@/lib/graphql-client';
import { getCurrentUser } from '@/lib/actions/users';
import { useQueryClient } from '@tanstack/react-query';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarColor } from '@/lib/utils/avatar-colors';

export default function Topbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; read?: boolean }>
  >(() => {
    try {
      const raw = localStorage.getItem('epitrello_notifications');
      const notes = raw ? JSON.parse(raw) : [];
      return Array.isArray(notes) ? notes : [];
    } catch {
      return [];
    }
  });

  const notificationsCount = notifications.filter((n) => !n.read).length;
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchDialog((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const raw = localStorage.getItem('epitrello_notifications');
        const notes = raw ? JSON.parse(raw) : [];
        if (Array.isArray(notes)) {
          setNotifications((prevNotifications) => {
            const previousUnread = prevNotifications.filter(
              (n) => !n.read,
            ).length;
            const newUnread = notes.filter(
              (n: { read?: boolean }) => !n.read,
            ).length;
            if (newUnread > previousUnread) {
              const newNotifications = notes.filter(
                (n: { read?: boolean; id: string; message: string }) =>
                  !n.read &&
                  !prevNotifications.find((existing) => existing.id === n.id),
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
    window.addEventListener(
      'epitrello:notification-added',
      handleStorageChange,
    );
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'epitrello:notification-added',
        handleStorageChange,
      );
    };
  }, []);

  const handleSignOut = async () => {
    try {
      clearAuthToken();
      clearEpitrelloLocalStorage();
      queryClient.clear();
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/auth/login');
    } catch (error) {
      console.error('Failed to sign out', error);
      router.push('/auth/login');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const [createOpen, setCreateOpen] = useState(false);

  const createBoard = (payload?: {
    name?: string;
    workspaceId?: string;
    visibility?: string;
    background?: string;
  }) => {
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

      const selectedBackground =
        background ||
        backgrounds[Math.floor(Math.random() * backgrounds.length)];

      const raw = localStorage.getItem('epitrello_boards');
      const boards = raw ? JSON.parse(raw) : [];
      const id =
        typeof crypto !== 'undefined' &&
        'randomUUID' in crypto &&
        typeof crypto.randomUUID === 'function'
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
    <header className='w-full bg-card border-b border-sidebar-border shrink-0'>
      <div className='w-full px-4 py-2 flex items-center justify-between gap-4 min-w-0'>
        <div className='flex items-center gap-3 min-w-0 flex-1'>
          <SidebarTrigger className='shrink-0' />
          {/* Search: opens dialog with Command on all breakpoints */}
          <Button
            variant='outline'
            className='flex-1 max-w-md justify-start text-muted-foreground font-normal gap-2'
            onClick={() => setShowSearchDialog(true)}
            aria-label='Search boards and workspaces'
          >
            <Search className='h-4 w-4 shrink-0' />
            <span className='hidden sm:inline'>
              Search boards, workspaces...
            </span>
          </Button>
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          {/* Create board */}
          <Button
            onClick={() => createBoard()}
            aria-label='Create a new board'
            className='hidden sm:inline-flex shrink-0'
          >
            + Create
          </Button>
          <Button
            onClick={() => createBoard()}
            aria-label='Create board'
            size='icon'
            className='sm:hidden shrink-0'
            title='Create'
          >
            +
          </Button>
          <CreateBoardModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreate={(p) => createBoard(p)}
          />

          {/* Notifications */}
          <Button
            aria-label={`Notifications, ${notificationsCount} unread`}
            variant='ghost'
            size='icon'
            title='Notifications'
            onClick={() => {
              const unreadNotifications = notifications.filter((n) => !n.read);
              if (unreadNotifications.length === 0) {
                toast.info('No new notifications');
                return;
              }

              unreadNotifications.forEach((notification) => {
                toast.info(notification.message);
              });

              const updatedNotifications = notifications.map((n) => ({
                ...n,
                read: true,
              }));
              setNotifications(updatedNotifications);
              try {
                localStorage.setItem(
                  'epitrello_notifications',
                  JSON.stringify(updatedNotifications),
                );
              } catch (error) {
                console.error('Failed to update notifications', error);
              }
            }}
            className='relative'
          >
            <Bell className='h-5 w-5' />
            {notificationsCount > 0 && (
              <span className='absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full'>
                {notificationsCount}
              </span>
            )}
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='shrink-0 h-auto p-1'
                aria-label='Open profile menu'
              >
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback
                    className={`text-white ${getAvatarColor(userName || userEmail)}`}
                  >
                    {userName
                      ? getInitials(userName)
                      : userEmail
                        ? userEmail.charAt(0).toUpperCase()
                        : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64 border-accent'>
              <DropdownMenuLabel>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback
                      className={`text-sm text-white ${getAvatarColor(userName || userEmail)}`}
                    >
                      {userName
                        ? getInitials(userName)
                        : userEmail
                          ? userEmail.charAt(0).toUpperCase()
                          : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <p className='text-sm font-medium leading-none'>
                      {userName || 'User'}
                    </p>
                    <p className='text-xs leading-none text-muted-foreground'>
                      {userEmail || ''}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Switch accounts (not implemented)');
                  }}
                  className='cursor-pointer'
                >
                  Switch accounts
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href='/settings' className='cursor-pointer'>
                  Manage account
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className='text-xs text-muted-foreground font-medium px-2 py-1.5'>
                Trello
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <a href='/auth/me' className='cursor-pointer'>
                  Profile and visibility
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Activity (not implemented)');
                  }}
                  className='cursor-pointer'
                >
                  Activity
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Cards (not implemented)');
                  }}
                  className='cursor-pointer'
                >
                  Cards
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href='/settings' className='cursor-pointer'>
                  Settings
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Help (not implemented)');
                  }}
                  className='cursor-pointer'
                >
                  Help
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className='cursor-pointer text-red-600'
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search Dialog with Command */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent
          className='h-[320px] w-[420px]  p-0 gap-0 overflow-hidden flex flex-col'
          showCloseButton={false}
        >
          <DialogTitle className='sr-only'>
            Search boards and workspaces
          </DialogTitle>
          <SearchWithAdvancedInput onClose={() => setShowSearchDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <HelpCircle className='h-5 w-5' />
              Epitrello Help Center
            </DialogTitle>
            <DialogDescription>
              Learn how to use Epitrello to organize your projects effectively.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6 mt-4'>
            {/* Getting Started */}
            <div className='space-y-3'>
              <h3 className='text-base font-semibold flex items-center gap-2'>
                <Zap className='h-4 w-4' />
                Getting started
              </h3>
              <ul className='space-y-2 text-sm text-muted-foreground ml-6'>
                <li className='list-disc'>
                  Create a <strong>workspace</strong> to organize your projects
                  by team or domain
                </li>
                <li className='list-disc'>
                  Add <strong>boards</strong> for each project in your workspace
                </li>
                <li className='list-disc'>
                  Use <strong>lists</strong> to represent your workflow stages
                  (To Do, In Progress, Done)
                </li>
                <li className='list-disc'>
                  Create <strong>cards</strong> for each task and drag them
                  between lists
                </li>
              </ul>
            </div>

            <Separator />

            {/* Key Features */}
            <div className='space-y-3'>
              <h3 className='text-base font-semibold'>Key features</h3>
              <div className='space-y-3 text-sm'>
                <div>
                  <strong className='text-foreground'>Interactive cards</strong>
                  <p className='text-muted-foreground'>
                    Add descriptions, checklists, labels and due dates to your
                    cards.
                  </p>
                </div>
                <div>
                  <strong className='text-foreground'>
                    Team collaboration
                  </strong>
                  <p className='text-muted-foreground'>
                    Invite members, assign tasks and comment on cards to
                    collaborate.
                  </p>
                </div>
                <div>
                  <strong className='text-foreground'>Customization</strong>
                  <p className='text-muted-foreground'>
                    Choose backgrounds for your boards and organize them to your
                    preferences.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Keyboard Shortcuts */}
            <div className='space-y-3'>
              <h3 className='text-base font-semibold flex items-center gap-2'>
                <Keyboard className='h-4 w-4' />
                Keyboard shortcuts
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
                <div className='flex justify-between p-2 rounded bg-muted/50'>
                  <span className='text-muted-foreground'>New card</span>
                  <kbd className='px-2 py-1 text-xs bg-background border rounded'>
                    N
                  </kbd>
                </div>
                <div className='flex justify-between p-2 rounded bg-muted/50'>
                  <span className='text-muted-foreground'>Search</span>
                  <kbd className='px-2 py-1 text-xs bg-background border rounded'>
                    Ctrl+F
                  </kbd>
                </div>
                <div className='flex justify-between p-2 rounded bg-muted/50'>
                  <span className='text-muted-foreground'>New board</span>
                  <kbd className='px-2 py-1 text-xs bg-background border rounded'>
                    B
                  </kbd>
                </div>
                <div className='flex justify-between p-2 rounded bg-muted/50'>
                  <span className='text-muted-foreground'>Help</span>
                  <kbd className='px-2 py-1 text-xs bg-background border rounded'>
                    ?
                  </kbd>
                </div>
              </div>
            </div>

            <Separator />

            {/* Support */}
            <div className='space-y-3'>
              <h3 className='text-base font-semibold'>Need more help?</h3>
              <p className='text-sm text-muted-foreground'>
                Check the full documentation or contact support for more
                information.
              </p>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => toast.info('Documentation coming soon')}
                >
                  Documentation
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => toast.info('Support coming soon')}
                >
                  Contact support
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
