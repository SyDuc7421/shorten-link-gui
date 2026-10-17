'use client';

import { useState } from 'react';
import { useNow } from 'next-intl';

import { splitLocalDateTime, startOfLocalDay, withDate, withTime } from '../model/expiry';

interface UseExpiryPickerViewModelOptions {
  /** `datetime-local` format (`YYYY-MM-DDTHH:mm`, local time), or `''` for none. */
  value: string;
  onChange: (value: string) => void;
}

export function useExpiryPickerViewModel({ value, onChange }: UseExpiryPickerViewModelOptions) {
  const now = useNow();
  const [isOpen, setIsOpen] = useState(false);
  const { date, time } = splitLocalDateTime(value);

  function selectDate(picked: Date | undefined) {
    if (!picked) return;
    onChange(withDate(value, picked));
    setIsOpen(false);
  }

  function changeTime(next: string) {
    if (!next) return;
    onChange(withTime(value, next, now));
  }

  return {
    selected: date ? startOfLocalDay(date) : undefined,
    time,
    today: startOfLocalDay(now),
    isOpen,
    onOpenChange: setIsOpen,
    selectDate,
    changeTime,
  };
}
