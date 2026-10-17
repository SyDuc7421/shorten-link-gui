'use client';

import { CircleAlert, Loader2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { toDisplayUrl } from '../model/display-url';
import type { Link } from '../model/types';
import { useDeleteLinkViewModel } from '../view-models/use-delete-link-view-model';

interface DeleteLinkDialogProps {
  link: Link;
  /** Called after the row is gone, so focus can move somewhere that still exists. */
  onDeleted: () => void;
}

export function DeleteLinkDialog({ link, onDeleted }: DeleteLinkDialogProps) {
  const t = useTranslations('links');
  const tCommon = useTranslations('common');
  const { isOpen, isPending, isError, onOpenChange, confirm } = useDeleteLinkViewModel(
    link,
    onDeleted,
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-11 text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive/20 lg:size-9 lg:px-0 dark:hover:bg-destructive/20"
            >
              <Trash2 aria-hidden="true" />
              <span className="lg:sr-only">{tCommon('delete')}</span>
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('deleteLink')}</TooltipContent>
      </Tooltip>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription className="break-words">
            {t('deleteDescription', { link: toDisplayUrl(link.short_url) })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isError ? (
          <Alert variant="destructive">
            <CircleAlert aria-hidden="true" />
            <AlertDescription>{t('deleteFailed')}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel className="h-11 md:h-9" disabled={isPending}>
            {tCommon('cancel')}
          </AlertDialogCancel>
          {/* A plain Button, not AlertDialogAction, so the dialog stays open until the delete lands. */}
          <Button
            type="button"
            variant="destructive"
            className="h-11 md:h-9"
            disabled={isPending}
            onClick={confirm}
          >
            {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {t('deleteConfirm')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
