'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import type { DueDate } from './types';

export interface CardModalDatesEditPopoverProps {
  startDate?: string;
  dueDate?: DueDate;
  selectedStartDate: string;
  selectedDate: string;
  onSetSelectedStartDate: (date: string) => void;
  onSetSelectedDate: (date: string) => void;
  onSaveStartDate: (date?: string) => void;
  onRemoveStartDate: () => void;
  onSaveDueDate: (date?: string) => void;
  onRemoveDueDate: () => void;
  trigger: React.ReactNode;
}

export function CardModalDatesEditPopover({
  startDate,
  dueDate,
  selectedStartDate,
  selectedDate,
  onSetSelectedStartDate,
  onSetSelectedDate,
  onSaveStartDate,
  onRemoveStartDate,
  onSaveDueDate,
  onRemoveDueDate,
  trigger,
}: CardModalDatesEditPopoverProps) {
  const [open, setOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState<Date | undefined>(
    selectedStartDate ? new Date(selectedStartDate) : undefined,
  );
  const [localDate, setLocalDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined,
  );
  const [enableStartDate, setEnableStartDate] = useState(!!startDate);
  const [enableDueDate, setEnableDueDate] = useState(!!dueDate);

  useEffect(() => {
    if (!open) return;

    const hasStartDate = !!startDate;
    const hasDueDate = !!dueDate;

    const timeoutId = setTimeout(() => {
      setEnableStartDate(hasStartDate);
      setEnableDueDate(hasDueDate);

      if (hasStartDate) {
        const date = new Date(startDate);
        setLocalStartDate(date);
        onSetSelectedStartDate(date.toISOString().split('T')[0]);
      } else {
        setLocalStartDate(undefined);
        onSetSelectedStartDate('');
      }
      if (hasDueDate) {
        const date = new Date(dueDate.date);
        setLocalDate(date);
        onSetSelectedDate(date.toISOString().split('T')[0]);
      } else {
        setLocalDate(undefined);
        onSetSelectedDate('');
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [open, startDate, dueDate, onSetSelectedStartDate, onSetSelectedDate]);

  const handleEnableStartDateChange = (checked: boolean) => {
    setEnableStartDate(checked);
    if (!checked) {
      setLocalStartDate(undefined);
      onSetSelectedStartDate('');
      if (startDate) {
        onRemoveStartDate();
      }
    }
  };

  const handleEnableDueDateChange = (checked: boolean) => {
    setEnableDueDate(checked);
    if (!checked) {
      setLocalDate(undefined);
      onSetSelectedDate('');
      if (dueDate) {
        onRemoveDueDate();
      }
    }
  };

  const handleSave = () => {
    if (enableStartDate && localStartDate) {
      const formatted = localStartDate.toISOString().split('T')[0];
      onSetSelectedStartDate(formatted);
      onSaveStartDate(formatted);
    } else if (!enableStartDate && startDate) {
      onRemoveStartDate();
    }

    if (enableDueDate && localDate) {
      const formatted = localDate.toISOString().split('T')[0];
      onSetSelectedDate(formatted);
      onSaveDueDate(formatted);
    } else if (!enableDueDate && dueDate) {
      onRemoveDueDate();
    }

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align='start' className='w-72 p-4 border-accent'>
        <h4 className='text-sm font-semibold text-trello mb-4'>Dates</h4>
        <div className='space-y-4'>
          {/* Start Date */}
          <div className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='enable-start-date'
                checked={enableStartDate}
                onCheckedChange={handleEnableStartDateChange}
              />
              <Label
                htmlFor='enable-start-date'
                className='text-sm font-medium text-trello cursor-pointer'
              >
                Start date
              </Label>
            </div>
            {enableStartDate && (
              <div className='ml-7 space-y-2'>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      data-empty={!localStartDate}
                      className='data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal'
                    >
                      {localStartDate ? (
                        format(localStartDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <ChevronDownIcon className='h-4 w-4' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={localStartDate}
                      onSelect={setLocalStartDate}
                      defaultMonth={localStartDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          <div className='border-t border-accent' />
          <div className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='enable-due-date'
                checked={enableDueDate}
                onCheckedChange={handleEnableDueDateChange}
              />
              <Label
                htmlFor='enable-due-date'
                className='text-sm font-medium text-trello cursor-pointer'
              >
                Due date
              </Label>
            </div>
            {enableDueDate && (
              <div className='ml-7 space-y-2'>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      data-empty={!localDate}
                      className='data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal'
                    >
                      {localDate ? (
                        format(localDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <ChevronDownIcon className='h-4 w-4' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={localDate}
                      onSelect={setLocalDate}
                      defaultMonth={localDate}
                      className='border-accent'
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className='pt-2'>
            <Button
              onClick={handleSave}
              size='sm'
              className='w-full'
              disabled={
                (enableStartDate && !localStartDate) ||
                (enableDueDate && !localDate)
              }
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
