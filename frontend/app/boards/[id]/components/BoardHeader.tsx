'use client';

import { useState } from 'react';
import { Board } from '../types';
import { Filter, Share2, Eye, MoreHorizontal, Star, Users, Settings, Archive, Tag, Sticker, Activity, EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { BoardMember } from '../types';

interface BoardHeaderProps {
  board: Board;
  onVisibilityChange?: (visibility: 'PRIVATE' | 'PUBLIC' | 'WORKSPACE') => void;
}

export function BoardHeader({ board, onVisibilityChange }: BoardHeaderProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  // Get visibility label
  const getVisibilityLabel = (visibility?: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return 'Private';
      case 'PUBLIC':
        return 'Public';
      case 'WORKSPACE':
        return 'Workspace';
      default:
        return 'Private';
    }
  };

  // Get visibility icon
  const getVisibilityIcon = (visibility?: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return <Eye className="w-4 h-4" />;
      case 'PUBLIC':
        return <EyeIcon className="w-4 h-4" />;
      case 'WORKSPACE':
        return <Users className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleInvite = () => {
    // TODO: Implement invite functionality
    console.log('Invite:', inviteEmail, inviteRole);
    setInviteEmail('');
  };

  const handleVisibilityChange = (newVisibility: 'PRIVATE' | 'PUBLIC' | 'WORKSPACE') => {
    if (onVisibilityChange) {
      onVisibilityChange(newVisibility);
    }
  };

  const boardMembers = board.members || [];

  return (
    <header
      className={`flex items-center justify-between p-3 text-white ${board.background || 'bg-primary'} shadow-lg`}
    >
      {/* Left side: Board title and visibility */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-white">{board.title}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-auto px-2 py-1"
            >
              {getVisibilityIcon(board.visibility)}
              <span className="ml-1 text-sm">{getVisibilityLabel(board.visibility)}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="border-accent">
            <DropdownMenuLabel>Change visibility</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleVisibilityChange('PRIVATE')}>
              <Eye className="w-4 h-4 mr-2" />
              <span>Private</span>
              {board.visibility === 'PRIVATE' && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleVisibilityChange('WORKSPACE')}>
              <Users className="w-4 h-4 mr-2" />
              <span>Workspace</span>
              {board.visibility === 'WORKSPACE' && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleVisibilityChange('PUBLIC')}>
              <EyeIcon className="w-4 h-4 mr-2" />
              <span>Public</span>
              {board.visibility === 'PUBLIC' && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right side: Actions and members */}
      <div className="flex items-center gap-2">
        {/* Filter cards */}
        <DropdownMenu open={showFilterMenu} onOpenChange={setShowFilterMenu}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              title="Filter cards"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 border-accent">
            <DropdownMenuLabel>Filter cards</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Users className="w-4 h-4 mr-2" />
              <span>Filter by members</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Tag className="w-4 h-4 mr-2" />
              <span>Filter by labels</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="w-4 h-4 mr-2">📅</span>
              <span>Filter by due date</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Clear all filters</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Star */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          title="Star board"
        >
          <Star className="w-5 h-5" />
        </Button>

        {/* Board members */}
        <div className="flex items-center gap-2 ml-2">
          {boardMembers.slice(0, 5).map((member: BoardMember) => (
            <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
              <AvatarImage src={member.user?.avatar ? member.user.avatar : undefined} />
              <AvatarFallback className="text-xs">
                {member.user?.name?.charAt(0) || member.user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          ))}
          {boardMembers.length > 5 && (
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs text-white border-2 border-white">
              +{boardMembers.length - 5}
            </div>
          )}
        </div>

        {/* Share button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleShare}
          className="bg-white/20 hover:bg-white/30 text-white border-0"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              title="Show menu"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 border-accent">
            <DropdownMenuLabel>Menu</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Share section */}
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
                <div className="ml-auto flex items-center gap-1">
                  {boardMembers.slice(0, 5).map((member: BoardMember) => (
                    <Avatar key={member.id} className="h-6 w-6 border border-accent">
                      <AvatarImage src={member.user?.avatar ? member.user.avatar : undefined} />
                      <AvatarFallback className="text-xs">
                        {member.user?.name?.charAt(0) || member.user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
              <DropdownMenuItem className="flex items-center gap-2">
                <span>ℹ️</span>
                <span>About this board</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                {getVisibilityIcon(board.visibility)}
                <span>Visibility: {getVisibilityLabel(board.visibility)}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span>Print, export, and share</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>Star</span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator />

            {/* Settings */}
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </div>
              <DropdownMenuItem className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-purple-500"></div>
                <span>Change background</span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator />

            {/* Tools */}
            <div className="px-2 py-1.5">
              <DropdownMenuItem className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>Labels</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Sticker className="w-4 h-4" />
                <span>Stickers</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Activity</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Archive className="w-4 h-4" />
                <span>Archived items</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <EyeIcon className="w-4 h-4" />
                <span>Watch</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md border-accent">
          <DialogHeader>
            <DialogTitle>Share board</DialogTitle>
            <DialogDescription>
              Invite people to collaborate on this board
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Invite section */}
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address or name</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-email"
                  placeholder="Enter email or name"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite}>Share</Button>
              </div>
            </div>

            {/* Share link */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Share2 className="w-4 h-4" />
                <span>Share this board with a link</span>
              </div>
              <Button variant="link" className="p-0 h-auto">
                Create link
              </Button>
            </div>

            <Separator />

            {/* Board members */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Board members</h3>
                <span className="text-xs text-muted-foreground">{boardMembers.length}</span>
              </div>
              <div className="space-y-2">
                {boardMembers.map((member: BoardMember) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user?.avatar ? member.user.avatar : undefined} />
                        <AvatarFallback className="text-xs">
                          {member.user?.name?.charAt(0) || member.user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {member.user?.name || member.user?.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.user?.email}
                        </div>
                      </div>
                    </div>
                    <Select defaultValue={member.role}>
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
