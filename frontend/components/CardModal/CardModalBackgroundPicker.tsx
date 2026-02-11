'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label as LabelComponent } from '@/components/ui/label';
import { BACKGROUND_COLORS } from './constants';

export type CardModalBackgroundPickerProps = {
  background: string | undefined;
  headerBackground: string | null;
  setHeaderBackground: (value: string | null) => void;
  saveBackground: (url: string) => Promise<void>;
  removeBackground: () => Promise<void>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  /** True while an image is being uploaded (disables file input, shows loading). */
  uploadingImage?: boolean;
};

export function CardModalBackgroundPicker({
  background,
  headerBackground,
  setHeaderBackground,
  saveBackground,
  removeBackground,
  onImageUpload,
  onClose,
  uploadingImage = false,
}: CardModalBackgroundPickerProps) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Change background</h3>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6'
          onClick={onClose}
        >
          <X className='w-4 h-4' />
        </Button>
      </div>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <div className='text-sm font-medium'>Upload Image</div>
          <div className='flex items-center gap-2'>
            <Input
              type='file'
              accept='image/*'
              onChange={onImageUpload}
              disabled={uploadingImage}
              className='flex-1'
              id='background-image-upload-header'
            />
            <LabelComponent
              htmlFor='background-image-upload-header'
              className={uploadingImage ? 'pointer-events-none opacity-70' : 'cursor-pointer'}
            >
              <Button variant='outline' size='sm' asChild disabled={uploadingImage}>
                <span>{uploadingImage ? 'Chargement…' : 'Choose File'}</span>
              </Button>
            </LabelComponent>
          </div>
        </div>
        <div className='space-y-2'>
          <div className='text-sm font-medium'>Colors</div>
          <div className='grid grid-cols-4 gap-2'>
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={async () => {
                  setHeaderBackground(color.value);
                  await saveBackground(color.value);
                  onClose();
                }}
                className={`h-12 rounded-lg ${
                  color.value
                } border-2 transition-all ${
                  (headerBackground === color.value ||
                    background === color.value) &&
                  !background?.startsWith('data:image')
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-transparent hover:border-accent'
                }`}
                title={color.label}
              />
            ))}
          </div>
          {(background || headerBackground) && (
            <Button
              variant='outline'
              size='sm'
              className='w-full'
              onClick={() => {
                if (background) {
                  removeBackground();
                } else {
                  setHeaderBackground(null);
                }
                onClose();
              }}
            >
              Remove background
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
