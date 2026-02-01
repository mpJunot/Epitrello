'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, X } from 'lucide-react';
import { updateBoard } from '@/lib/actions/boards';
import { toast } from '@/lib/toast';
import { BACKGROUND_COLORS } from '@/components/CardModal/constants';
import type { Board } from '../../types';

interface ChangeBackgroundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board;
  onUpdate: () => void;
}

export function ChangeBackgroundDialog({ open, onOpenChange, board, onUpdate }: ChangeBackgroundDialogProps) {
  const [backgroundInput, setBackgroundInput] = useState('');
  const [localBackground, setLocalBackground] = useState<string | undefined>(undefined);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (board) {
      setBackgroundInput(board.background || '');
      setLocalBackground(board.background || undefined);
    }
  }, [board, open]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        saveBoardBackground(base64);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const saveBoardBackground = async (url: string) => {
    setUpdating(true);
    try {
      await updateBoard({
        id: board.id,
        background: url.trim(),
      });
      setLocalBackground(url.trim());
      setBackgroundInput(url.trim());
      toast.success('Background updated successfully');
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update background';
      toast.error(message);
      console.error('Failed to update board background', error);
    } finally {
      setUpdating(false);
    }
  };

  /** URL safe for img src: only data:image or http(s) to avoid CodeQL "DOM text reinterpreted as HTML". */
  const safePreviewUrl =
    localBackground &&
    (localBackground.startsWith('data:image') ||
      localBackground.startsWith('https://') ||
      localBackground.startsWith('http://'))
      ? localBackground
      : undefined;

  const removeBoardBackground = async () => {
    setUpdating(true);
    try {
      await updateBoard({
        id: board.id,
        background: null,
      });
      setLocalBackground(undefined);
      setBackgroundInput('');
      toast.success('Background removed');
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove background';
      toast.error(message);
      console.error('Failed to remove board background', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-accent">
        <DialogHeader>
          <DialogTitle>Change background</DialogTitle>
          <DialogDescription>
            Customize the background of your board
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Upload Image</div>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1"
                id="board-background-upload"
              />
              <Label
                htmlFor="board-background-upload"
                className="cursor-pointer"
              >
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <ImageIcon className="w-4 h-4 mr-2 inline" />
                    Choose Image
                  </span>
                </Button>
              </Label>
            </div>
            {safePreviewUrl && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-accent">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={safePreviewUrl}
                    alt="Background preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={removeBoardBackground}
                    disabled={updating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Image URL</div>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter image URL"
                value={backgroundInput}
                onChange={(e) => setBackgroundInput(e.target.value)}
                className="flex-1"
              />
              {backgroundInput.trim() !== localBackground && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const url = backgroundInput.trim();
                    if (url) {
                      saveBoardBackground(url);
                    } else if (localBackground) {
                      removeBoardBackground();
                    }
                  }}
                  disabled={updating}
                >
                  Save
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Colors</div>
            <div className="grid grid-cols-4 gap-2">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={async () => {
                    await saveBoardBackground(color.value);
                  }}
                  disabled={updating}
                  className={`h-12 rounded-lg ${color.value} border-2 transition-all ${
                    localBackground === color.value &&
                    !localBackground?.startsWith('data:image') &&
                    !localBackground?.startsWith('http')
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-transparent hover:border-accent'
                  }`}
                  title={color.label}
                />
              ))}
            </div>
            {localBackground && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={removeBoardBackground}
                disabled={updating}
              >
                Remove background
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
