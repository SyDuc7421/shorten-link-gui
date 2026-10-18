'use client';

import { useId } from 'react';
import { CircleAlert, Loader2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { useConfirmActionViewModel } from '../view-models/use-confirm-action-view-model';

interface ConfirmActionDialogProps {
  /** The button that opens the dialog. */
  trigger: React.ReactElement;
  /** For an icon-only trigger (row actions from lg). */
  tooltip?: string;
  title: string;
  description: string;
  confirmLabel: string;
  isDestructive: boolean;
  /** Offer the optional reason stored in the audit log. */
  hasReason: boolean;
  successMessage: string;
  onConfirm: (reason: string | null) => Promise<unknown>;
  onDone?: () => void;
}

/** Every admin state change confirms first (spec §6.3). */
export function ConfirmActionDialog({
  trigger,
  tooltip,
  title,
  description,
  confirmLabel,
  isDestructive,
  hasReason,
  successMessage,
  onConfirm,
  onDone,
}: ConfirmActionDialogProps) {
  const t = useTranslations('admin.confirm');
  const tCommon = useTranslations('common');
  const reasonId = useId();
  const hintId = useId();
  const { isOpen, onOpenChange, reason, onReasonChange, isPending, errorMessage, confirm } =
    useConfirmActionViewModel({ onConfirm, successMessage, onDone });

  const dialogTrigger = <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{dialogTrigger}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        dialogTrigger
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="break-words">{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {hasReason ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor={reasonId}>{t('reasonLabel')}</Label>
            <Textarea
              id={reasonId}
              rows={3}
              value={reason}
              aria-describedby={hintId}
              onChange={(event) => onReasonChange(event.target.value)}
            />
            <p id={hintId} className="text-sm text-muted-foreground">
              {t('reasonHint')}
            </p>
          </div>
        ) : null}

        {errorMessage ? (
          <Alert variant="destructive">
            <CircleAlert aria-hidden="true" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel className="h-11 md:h-9" disabled={isPending}>
            {tCommon('cancel')}
          </AlertDialogCancel>
          {/* A plain Button, not AlertDialogAction, so the dialog stays open until the request lands. */}
          <Button
            type="button"
            variant={isDestructive ? 'destructive' : 'default'}
            className="h-11 md:h-9"
            disabled={isPending}
            onClick={confirm}
          >
            {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
