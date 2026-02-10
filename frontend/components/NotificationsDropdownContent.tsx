'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  MoreVertical,
  ExternalLink,
  Check,
  UserPlus,
  CalendarClock,
  MessageSquare,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from '@/components/ui/popover';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemActions,
} from '@/components/ui/item';
import {
  notificationMessage,
  notificationHref,
  getMyNotificationPreferences,
  updateMyNotificationPreferences,
  type Notification,
  type NotificationType,
  type NotificationEmailFrequency,
} from '@/lib/actions/notifications';

function notificationIcon(type: NotificationType) {
  switch (type) {
    case 'CARD_ASSIGNED':
      return <UserPlus className='size-4' />;
    case 'CARD_DUE_SOON':
      return <CalendarClock className='size-4' />;
    case 'COMMENT_ADDED':
      return <MessageSquare className='size-4' />;
    case 'BOARD_INVITATION':
      return <LayoutDashboard className='size-4' />;
    case 'WORKSPACE_INVITATION':
      return <Users className='size-4' />;
    default:
      return <Bell className='size-4' />;
  }
}

function notificationTime(createdAt: string) {
  try {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  } catch {
    return '';
  }
}

export type NotificationsDropdownContentProps = {
  notifications: Notification[];
  unreadCount: number;
  unreadOnly: boolean;
  onUnreadOnlyChange: (value: boolean) => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  /** Called when user clicks a notification (e.g. to close the dropdown). */
  onNotificationClick?: () => void;
};

export default function NotificationsDropdownContent({
  notifications,
  unreadCount,
  unreadOnly,
  onUnreadOnlyChange,
  onMarkRead,
  onMarkAllRead,
  onNotificationClick,
}: NotificationsDropdownContentProps) {
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const uniqueNotifications = useMemo(() => {
    const seen = new Set<string>();
    return notifications.filter((n) => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
  }, [notifications]);

  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: getMyNotificationPreferences,
    enabled: settingsOpen,
  });

  const handleEmailFrequencyChange = async (
    value: NotificationEmailFrequency,
  ) => {
    try {
      await updateMyNotificationPreferences({ emailFrequency: value });
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
    } catch (e) {
      console.error('Failed to update email frequency', e);
    }
  };

  const handleDesktopNotificationsChange = async (checked: boolean) => {
    try {
      await updateMyNotificationPreferences({
        allowDesktopNotifications: checked,
      });
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
    } catch (e) {
      console.error('Failed to update desktop notifications', e);
    }
  };

  return (
    <div className='w-96 min-w-96 max-w-full'>
      <div className='border-b border-accent'>
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <div className='flex items-center justify-between gap-2 px-3 py-2'>
            <span className='font-medium text-sm shrink-0'>Notifications</span>
            <div className='flex items-center gap-2 min-w-0'>
              {unreadCount > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-xs h-auto py-1 shrink-0'
                  onClick={onMarkAllRead}
                >
                  Mark all read
                </Button>
              )}
              <label className='flex items-center gap-2 cursor-pointer text-sm text-muted-foreground shrink-0'>
                <Switch
                  checked={unreadOnly}
                  onCheckedChange={onUnreadOnlyChange}
                />
                <span>Only show unread</span>
              </label>
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 shrink-0'
                  aria-label='Notifications settings'
                >
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </PopoverTrigger>
            </div>
          </div>
          <PopoverContent
            align='end'
            className='w-[300px] p-0 border-accent rounded-lg'
            sideOffset={8}
          >
            <PopoverHeader className='p-3 pb-2'>
              <PopoverTitle>Notifications settings</PopoverTitle>
              <PopoverDescription>
                Configure how you receive notifications.
              </PopoverDescription>
            </PopoverHeader>
            <div className='flex flex-col gap-4 px-3 pb-3'>
              <div className='space-y-2'>
                <Label>Notification email frequency</Label>
                <Select
                  value={preferences?.emailFrequency ?? 'PERIODICALLY'}
                  onValueChange={handleEmailFrequencyChange}
                  disabled={preferencesLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='PERIODICALLY'>Periodically</SelectItem>
                    <SelectItem value='INSTANT'>Instant</SelectItem>
                    <SelectItem value='DAILY'>Daily digest</SelectItem>
                    <SelectItem value='NEVER'>Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center justify-between gap-2'>
                <Label htmlFor='desktop-notif' className='cursor-pointer'>
                  Allow desktop notifications
                </Label>
                <Switch
                  id='desktop-notif'
                  checked={preferences?.allowDesktopNotifications ?? false}
                  onCheckedChange={handleDesktopNotificationsChange}
                  disabled={preferencesLoading}
                />
              </div>
              <Link
                href='/settings'
                className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                All notification settings
                <ExternalLink className='h-4 w-4' />
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <ScrollArea className='h-[360px]'>
        <div className='p-2'>
          {uniqueNotifications.length === 0 ? (
            <Empty className='border-0 p-6 min-h-[200px] justify-center'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <Bell className='size-5' />
                </EmptyMedia>
                <EmptyTitle>
                  {unreadOnly ? 'No unread notifications' : 'No notifications'}
                </EmptyTitle>
                <EmptyDescription>
                  {unreadOnly
                    ? "You're all caught up."
                    : "You'll see updates here when someone assigns you, comments, or invites you."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ItemGroup className='gap-2'>
              {uniqueNotifications.map((n) => {
                const href = notificationHref(n);
                const content = (
                  <>
                    <ItemMedia variant='icon'>
                      {notificationIcon(n.type)}
                    </ItemMedia>
                    <ItemContent className='min-w-0 flex-1'>
                      <ItemTitle className='font-normal text-sm'>
                        {notificationMessage(n)}
                      </ItemTitle>
                      <ItemDescription>
                        {notificationTime(n.createdAt)}
                      </ItemDescription>
                    </ItemContent>
                    {!n.read && (
                      <ItemActions>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-muted-foreground hover:text-foreground'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onMarkRead(n.id);
                          }}
                          aria-label='Mark notification as read'
                        >
                          <Check className='h-4 w-4' />
                        </Button>
                      </ItemActions>
                    )}
                  </>
                );

                if (href) {
                  return (
                    <Item
                      key={n.id}
                      asChild
                      variant={n.read ? 'outline' : 'muted'}
                      size='sm'
                      className='rounded-lg border-accent cursor-pointer'
                    >
                      <Link
                        href={href}
                        className='flex w-full items-stretch'
                        onClick={onNotificationClick}
                      >
                        {content}
                      </Link>
                    </Item>
                  );
                }

                return (
                  <Item
                    key={n.id}
                    variant={n.read ? 'outline' : 'muted'}
                    size='sm'
                    className='rounded-lg border-accent'
                  >
                    {content}
                  </Item>
                );
              })}
            </ItemGroup>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
