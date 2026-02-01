'use client';

import React, { useState, useRef } from 'react';
import { Paperclip, Link as LinkIcon, Upload, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Attachment } from '@/lib/actions/attachments';
import { toast } from '@/lib/toast';

const MAX_DATA_URL_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  } catch {
    return '';
  }
}

function filenameFromUrl(url: string): string {
  try {
    if (url.startsWith('data:')) return 'File';
    const u = new URL(url);
    const path = u.pathname;
    const segment = path.split('/').filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : 'Link';
  } catch {
    return 'Link';
  }
}

function isImageUrl(url: string): boolean {
  if (url.startsWith('data:')) {
    return url.startsWith('data:image/');
  }
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    return /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i.test(path) || path.includes('/image');
  } catch {
    return false;
  }
}

/** Shared form content for adding an attachment (link or file). Used in popover when no attachments and in section Add button. */
function AddAttachmentFormContent({
  cardId,
  onCreateAttachment,
  onClose,
}: {
  cardId: string;
  onCreateAttachment: (input: {
    cardId: string;
    url: string;
    filename: string;
    size: number;
  }) => Promise<unknown>;
  onClose: () => void;
}) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkFilename, setLinkFilename] = useState('');
  const [addingLink, setAddingLink] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddLink = async () => {
    const url = linkUrl.trim();
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }
    const filename = linkFilename.trim() || filenameFromUrl(url);
    setAddingLink(true);
    try {
      await onCreateAttachment({ cardId, url, filename, size: 0 });
      setLinkUrl('');
      setLinkFilename('');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add link');
    } finally {
      setAddingLink(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_DATA_URL_SIZE_BYTES) {
      toast.error('File too large. Maximum size is 2 MB for direct upload.');
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      await onCreateAttachment({
        cardId,
        url,
        filename: file.name,
        size: file.size,
      });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
    fileInputRef.current?.form?.reset();
  };

  return (
    <>
      <h4 className="text-sm font-semibold text-trello mb-3">Add attachment</h4>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-trello-secondary">Link</Label>
          <Input
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddLink();
            }}
          />
          <Input
            placeholder="Display name (optional)"
            value={linkFilename}
            onChange={(e) => setLinkFilename(e.target.value)}
            className="w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddLink();
            }}
          />
          <Button
            size="sm"
            className="w-full"
            onClick={handleAddLink}
            disabled={!linkUrl.trim() || addingLink}
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            {addingLink ? 'Adding…' : 'Add link'}
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-accent" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-popover px-2 text-trello-secondary">or</span>
          </div>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading…' : 'Upload file (max 2 MB)'}
          </Button>
        </div>
      </div>
    </>
  );
}

/** Popover to add an attachment, used from QuickActions when there are no attachments yet. */
export function CardModalAttachmentAddPopover({
  trigger,
  cardId,
  onCreateAttachment,
}: {
  trigger: React.ReactNode;
  cardId: string;
  onCreateAttachment: (input: {
    cardId: string;
    url: string;
    filename: string;
    size: number;
  }) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3 border-accent">
        <AddAttachmentFormContent
          cardId={cardId}
          onCreateAttachment={onCreateAttachment}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

export interface CardModalAttachmentsProps {
  attachments: Attachment[];
  cardId: string;
  currentUserId: string;
  onCreateAttachment: (input: {
    cardId: string;
    url: string;
    filename: string;
    size: number;
  }) => Promise<Attachment>;
  onDeleteAttachment: (id: string) => Promise<void>;
  /** When set, the Add popover is controlled by the parent (e.g. from QuickActions Attachment button) */
  addPopoverOpen?: boolean;
  onAddPopoverOpenChange?: (open: boolean) => void;
  readOnly?: boolean;
}

export function CardModalAttachments({
  attachments,
  cardId,
  currentUserId,
  onCreateAttachment,
  onDeleteAttachment,
  addPopoverOpen,
  onAddPopoverOpenChange,
  readOnly = false,
}: CardModalAttachmentsProps) {
  const [localPopoverOpen, setLocalPopoverOpen] = useState(false);
  const isControlled = addPopoverOpen !== undefined;
  const popoverOpen = isControlled ? addPopoverOpen : localPopoverOpen;
  const setPopoverOpen = isControlled
    ? (onAddPopoverOpenChange ?? (() => {}))
    : setLocalPopoverOpen;

  const handleDelete = async (id: string) => {
    try {
      await onDeleteAttachment(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete attachment');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="w-4 h-4 text-trello-text-secondary shrink-0" />
        <h3 className="text-sm font-semibold text-trello">Attachments</h3>
        {!readOnly && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-sm bg-muted hover:bg-muted/80 text-foreground rounded-md"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-3 border-accent">
              <AddAttachmentFormContent
                cardId={cardId}
                onCreateAttachment={onCreateAttachment}
                onClose={() => setPopoverOpen(false)}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="ml-7">
        <h4 className="text-sm font-semibold text-trello mb-2">Files</h4>
        <ul className="flex flex-col gap-2">
            {attachments.map((att) => {
              const isUploader = att.uploaderId === currentUserId;
              const openUrl = att.url;
              const isImage = isImageUrl(att.url);
              return (
                <li
                  key={att.id}
                  className="flex items-center gap-3 group text-sm rounded-md hover:bg-trello-hover/50 p-2 -mx-2"
                >
                  {isImage ? (
                    <a
                      href={openUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 w-14 h-14 rounded-md overflow-hidden border border-accent bg-muted flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={openUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      href={openUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-1 rounded hover:bg-trello-hover text-trello-text-secondary hover:text-trello"
                      aria-label="Open attachment"
                    >
                      <Paperclip className="w-4 h-4" />
                    </a>
                  )}
                  <span className="flex-1 min-w-0 truncate text-trello">
                    {att.filename}
                  </span>
                  <span className="text-trello-text-secondary shrink-0">
                    {att.size > 0 ? formatSize(att.size) : 'Link'}
                  </span>
                  <span className="text-trello-text-secondary shrink-0 text-xs">
                    {formatDate(att.createdAt)}
                  </span>
                  {!readOnly && isUploader && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 text-trello-secondary hover:text-destructive"
                      onClick={() => handleDelete(att.id)}
                      aria-label="Delete attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
