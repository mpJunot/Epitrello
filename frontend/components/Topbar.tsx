'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CreateBoardPopoverContent from './CreateBoardPopoverContent';
import { toast } from '@/lib/toast';
import { Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { SearchWithAdvancedInput } from './SearchWithAdvancedInput';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  clearAuthToken,
  clearEpitrelloLocalStorage,
} from '@/lib/graphql-client';
import { getCurrentUser } from '@/lib/actions/users';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  notificationMessage,
  type Notification,
} from '@/lib/actions/notifications';
import { useNotificationSubscription } from '@/lib/hooks/use-notification-subscription';
import NotificationsDropdownContent from './NotificationsDropdownContent';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { createBoard as createBoardAction, type Visibility } from '@/lib/actions/boards';
import { workspaceBoardsQueryKey } from '@/lib/queries/workspaces';

export default function Topbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  const queryClient = useQueryClient();
  const [notificationsUnreadOnly, setNotificationsUnreadOnly] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return (
        localStorage.getItem('epitrello_notifications_unread_only') === 'true'
      );
    } catch {
      return false;
    }
  });
  const handleUnreadOnlyChange = (value: boolean) => {
    setNotificationsUnreadOnly(value);
    try {
      localStorage.setItem(
        'epitrello_notifications_unread_only',
        value ? 'true' : 'false',
      );
    } catch {
      // ignore
    }
  };
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications', notificationsUnreadOnly],
    queryFn: () =>
      getMyNotifications({
        limit: 50,
        unreadOnly: notificationsUnreadOnly || undefined,
      }),
    enabled: !isAuthPage,
    refetchOnWindowFocus: true,
    refetchInterval: 15_000,
  });
  const notifications = notificationsData?.notifications ?? [];
  const notificationsCount = notifications.filter((n) => !n.read).length;

  useNotificationSubscription(
    {
      onNotification: (notification) => {
        toast.info(notificationMessage(notification), 'Notification');
        [true, false].forEach((unreadOnly) => {
          queryClient.setQueryData<{
            notifications: Notification[];
            hasMore: boolean;
            nextCursor?: string | null;
          }>(['notifications', unreadOnly], (prev) => {
            if (!prev) return prev;
            const exists = prev.notifications.some(
              (n) => n.id === notification.id,
            );
            if (exists) return prev;
            if (unreadOnly && notification.read) return prev;
            return {
              ...prev,
              notifications: [notification, ...prev.notifications],
            };
          });
        });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.refetchQueries({ queryKey: ['notifications'] });
      },
    },
    !isAuthPage,
  );

  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
    if (notificationsOpen && !isAuthPage) refetchNotifications();
  }, [notificationsOpen, isAuthPage, refetchNotifications]);

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

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      [true, false].forEach((unreadOnly) => {
        queryClient.setQueryData<{
          notifications: Notification[];
          hasMore: boolean;
          nextCursor?: string | null;
        }>(['notifications', unreadOnly], (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            notifications: prev.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n,
            ),
          };
        });
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (e) {
      console.error('Failed to mark notification read', e);
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsRead();
      [true, false].forEach((unreadOnly) => {
        queryClient.setQueryData<{
          notifications: Notification[];
          hasMore: boolean;
          nextCursor?: string | null;
        }>(['notifications', unreadOnly], (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            notifications: prev.notifications.map((n) => ({
              ...n,
              read: true,
            })),
          };
        });
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (e) {
      console.error('Failed to mark all read', e);
      toast.error('Failed to update notifications');
    }
  };

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

  const [createPopoverOpen, setCreatePopoverOpen] = useState(false);
  const [createPopoverKey, setCreatePopoverKey] = useState(0);

  const createBoard = async (payload?: {
    name?: string;
    workspaceId?: string;
    visibility?: string;
    background?: string;
    templateId?: string;
  }) => {
    if (!payload) return;

    const { name, workspaceId, visibility, background, templateId } = payload;
    if (!name?.trim()) return;

    const visMap: Record<string, Visibility> = {
      personal: 'PRIVATE',
      workspace: 'WORKSPACE',
      public: 'PUBLIC',
    };

    try {
      const newBoard = await createBoardAction({
        title: name.trim(),
        visibility: visibility ? visMap[visibility] : undefined,
        workspaceId,
        background,
        templateId,
      });

      if (newBoard.workspaceId) {
        queryClient.invalidateQueries({
          queryKey: workspaceBoardsQueryKey(newBoard.workspaceId),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });

      router.push(`/boards/${newBoard.id}`);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Unable to create board';
      toast.error(msg);
      throw e;
    }
  };

  if (isAuthPage) {
    return null;
  }

  return (
    <header className='w-full bg-card border-b border-accent shrink-0'>
      <div className='w-full px-4 py-2 flex items-center gap-4 min-w-0'>
        <Link
          href='/dashboard'
          className='flex items-center gap-2 shrink-0 rounded-md hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          aria-label='Epitrello - Accueil'
        >
          <div className='h-8 w-8 rounded bg-trello-blue text-white flex items-center justify-center font-bold'>
            E
          </div>
          <span className='text-sm font-semibold text-foreground hidden sm:inline'>
            Epitrello
          </span>
        </Link>

        <div className='flex-1 flex justify-center min-w-0'>
          <Button
            variant='outline'
            className='w-full max-w-md justify-start text-muted-foreground font-normal gap-2'
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
          {/* Create – Trello-style popover (one trigger: desktop "Create" or mobile "+") */}
          <Popover
            open={createPopoverOpen}
            onOpenChange={(open) => {
              setCreatePopoverOpen(open);
              if (open) setCreatePopoverKey((k) => k + 1);
            }}
          >
            <PopoverTrigger asChild>
              <Button
                aria-label='Create'
                title='Create'
                className='shrink-0 h-9 w-9 sm:w-auto sm:px-4 bg-trello-blue hover:bg-trello-blue/90 text-white'
              >
                <span className='sm:hidden'>+</span>
                <span className='hidden sm:inline'>+ Create</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align='end'
              sideOffset={6}
              className='w-[360px] max-w-[calc(100vw-2rem)] p-0 rounded-lg border border-accent bg-card shadow-lg max-h-[min(85vh,520px)] min-h-0 overflow-y-auto overflow-x-hidden'
            >
              <CreateBoardPopoverContent
                key={createPopoverKey}
                open={createPopoverOpen}
                onClose={() => setCreatePopoverOpen(false)}
                onCreate={async (p) => {
                  try {
                    await createBoard(p);
                    setCreatePopoverOpen(false);
                  } catch {
                    /* createBoard already shows toast */
                  }
                }}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={`Notifications, ${notificationsCount} unread`}
                variant='ghost'
                size='icon'
                className='relative'
                title='Notifications'
              >
                <Bell className='h-5 w-5' />
                {notificationsCount > 0 && (
                  <span className='absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full min-w-5'>
                    {notificationsCount > 99 ? '99+' : notificationsCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-96 min-w-96 max-w-[calc(100vw-2rem)] p-0 border-accent'
            >
              <NotificationsDropdownContent
                notifications={notifications}
                unreadCount={notificationsCount}
                unreadOnly={notificationsUnreadOnly}
                onUnreadOnlyChange={handleUnreadOnlyChange}
                onMarkRead={handleMarkNotificationRead}
                onMarkAllRead={handleMarkAllNotificationsRead}
                onNotificationClick={() => setNotificationsOpen(false)}
              />
            </DropdownMenuContent>
          </DropdownMenu>

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
                  <AvatarImage
                    src={userAvatar}
                    alt={userName}
                    className='object-cover'
                  />
                  <AvatarFallback
                    className={`text-white ${getAvatarColor(
                      userName || userEmail,
                    )}`}
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
                    <AvatarImage
                      src={userAvatar}
                      alt={userName}
                      className='object-cover'
                    />
                    <AvatarFallback
                      className={`text-sm text-white ${getAvatarColor(
                        userName || userEmail,
                      )}`}
                    >
                      {userName
                        ? getInitials(userName)
                        : userEmail
                          ? userEmail.charAt(0).toUpperCase()
                          : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col gap-1'>
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
                <Link href='/settings' className='cursor-pointer'>
                  Manage account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className='text-xs text-muted-foreground font-medium px-2 py-1.5'>
                Trello
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href='/profile' className='cursor-pointer'>
                  Profile and visibility
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/activity' className='cursor-pointer'>
                  Activity
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/cards' className='cursor-pointer'>
                  Cards
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/settings' className='cursor-pointer'>
                  Settings
                </Link>
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
    </header>
  );
}
