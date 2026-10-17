'use client';

import { CalendarDays, ChevronDown, Clock } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { useExpiryPickerViewModel } from '../view-models/use-expiry-picker-view-model';

interface ExpiryPickerProps extends Omit<
  React.ComponentProps<'button'>,
  'value' | 'onChange' | 'onBlur'
> {
  /** `datetime-local` format (`YYYY-MM-DDTHH:mm`, local time), or `''` for none. */
  value: string;
  onChange: (value: string) => void;
  /** Marks the field touched; fired by either control. */
  onBlur: () => void;
}

/**
 * Calendar for the day, a time field for the hour. Rest props (id, aria-*)
 * land on the date trigger, so `FormControl` labels it like a native input.
 */
export function ExpiryPicker({
  value,
  onChange,
  onBlur,
  className,
  ...triggerProps
}: ExpiryPickerProps) {
  const t = useTranslations('links');
  const format = useFormatter();
  const { selected, time, today, isOpen, onOpenChange, selectDate, changeTime } =
    useExpiryPickerViewModel({ value, onChange });

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-2 sm:flex-none sm:flex-row', className)}>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 min-w-0 justify-start rounded-lg font-normal sm:w-60"
            onBlur={onBlur}
            {...triggerProps}
          >
            <CalendarDays className="text-muted-foreground" aria-hidden="true" />
            <span className={cn('truncate', !selected && 'text-muted-foreground')}>
              {selected ? format.dateTime(selected, { dateStyle: 'medium' }) : t('pickDate')}
            </span>
            <ChevronDown className="ml-auto text-muted-foreground" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" collisionPadding={16}>
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={selectDate}
            disabled={{ before: today }}
            autoFocus
            className="p-2 [--cell-size:--spacing(11)] sm:p-3 sm:[--cell-size:--spacing(9)]"
          />
        </PopoverContent>
      </Popover>

      <div className="relative sm:w-36">
        <Clock
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="time"
          aria-label={t('expiryTime')}
          value={time}
          onChange={(event) => changeTime(event.target.value)}
          onBlur={onBlur}
          className="h-11 appearance-none rounded-lg bg-background pl-9 tabular-nums [&::-webkit-calendar-picker-indicator]:hidden"
        />
      </div>
    </div>
  );
}
