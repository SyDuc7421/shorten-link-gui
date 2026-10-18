'use client';

import { useId } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ALL_OPTION, type ListToolbarModel } from '../view-models/use-list-toolbar-view-model';

interface ListToolbarProps {
  toolbar: ListToolbarModel;
  searchLabel: string;
  statuses: readonly { value: string; label: string }[];
}

/** Filters above the list, left-aligned (DESIGN.md §14). */
export function ListToolbar({ toolbar, searchLabel, statuses }: ListToolbarProps) {
  const t = useTranslations('admin.list');
  const searchId = useId();
  const statusId = useId();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Label htmlFor={searchId}>{searchLabel}</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id={searchId}
            type="search"
            autoComplete="off"
            value={toolbar.search}
            onChange={(event) => toolbar.onSearchChange(event.target.value)}
            className="h-11 pl-9 md:h-9"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:w-48">
        <Label htmlFor={statusId}>{t('statusLabel')}</Label>
        <Select value={toolbar.status} onValueChange={toolbar.onStatusChange}>
          <SelectTrigger
            id={statusId}
            className="w-full data-[size=default]:h-11 md:data-[size=default]:h-9"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION}>{t('allStatuses')}</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
