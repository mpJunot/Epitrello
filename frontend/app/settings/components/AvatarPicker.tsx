'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { User, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { uploadAvatar } from '@/lib/actions/users';
import { toast } from '@/lib/toast';

function isValidHttpUrl(s: string): boolean {
  if (!s?.trim()) return false;
  try {
    const u = new URL(s.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';

interface AvatarPickerProps {
  value: string;
  onUploaded: (url: string) => void;
  disabled?: boolean;
  className?: string;
  /** 'large' for profile/settings: big avatar and centered block */
  size?: 'default' | 'large';
}

export function AvatarPicker({
  value,
  onUploaded,
  disabled = false,
  className,
  size = 'default',
}: AvatarPickerProps) {
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const url = (value ?? '').trim();

  // Reset error when URL changes so we retry display (preload was hiding valid URLs on race/Strict Mode)
  useEffect(() => {
    setImgError(false);
  }, [url]);

  const displayUrl = previewUrl ?? (isValidHttpUrl(url) && !imgError ? url : null);
  const showPlaceholder = !displayUrl;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const mime = file.type?.toLowerCase();
    if (!ACCEPT.split(',').some((t) => t.trim() === mime)) {
      toast.error('Use JPEG, PNG, GIF or WebP');
      return;
    }
    setUploading(true);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    try {
      const { url: newUrl } = await uploadAvatar(file);
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
      onUploaded(newUrl);
      toast.success('Image ready. Click Save to apply.');
    } catch (err) {
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const isLarge = size === 'large';

  return (
    <div
      className={cn(
        'space-y-3',
        isLarge && 'flex flex-col items-center pb-2',
        className,
      )}
    >
      <Label className={isLarge ? 'text-base' : ''}>Avatar</Label>
      <div
        className={cn(
          'flex flex-wrap items-start gap-4',
          isLarge && 'flex-col items-center gap-5',
        )}
      >
        <div
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted',
            isLarge ? 'h-40 w-40' : 'h-24 w-24',
          )}
          role="img"
          aria-label={displayUrl ? 'Avatar preview' : 'Avatar placeholder'}
        >
          {showPlaceholder ? (
            <User
              className={cn('text-muted-foreground', isLarge ? 'h-20 w-20' : 'h-10 w-10')}
              aria-hidden
            />
          ) : displayUrl ? (
            <Image
              src={displayUrl}
              alt="Avatar preview"
              width={isLarge ? 160 : 96}
              height={isLarge ? 160 : 96}
              className={cn('h-full w-full object-cover', isLarge ? 'h-40 w-40' : 'h-24 w-24')}
              unoptimized
              onError={() => setImgError(true)}
            />
          ) : null}
        </div>
        <div className={cn('flex flex-col gap-2', isLarge && 'items-center')}>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            aria-hidden
            onChange={handleFileChange}
            disabled={disabled || uploading}
          />
          <Button
            type="button"
            variant="outline"
            size={isLarge ? 'default' : 'sm'}
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2"
          >
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className={isLarge ? 'h-5 w-5' : 'h-4 w-4'} />
                Choose image
              </>
            )}
          </Button>
          <p className={cn('text-xs text-muted-foreground', isLarge && 'text-center')}>
            JPEG, PNG, GIF or WebP.
          </p>
        </div>
      </div>
    </div>
  );
}
