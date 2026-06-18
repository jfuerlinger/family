'use client';

import { useTranslations } from 'next-intl';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  description: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonProps['variant'];
  pending?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  description,
  title,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'danger',
  pending = false,
}: ConfirmDialogProps) {
  const tCommon = useTranslations('common');

  return (
    <Dialog open={open} onClose={onClose} title={title ?? tCommon('confirm')}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{description}</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            {cancelLabel ?? tCommon('cancel')}
          </Button>
          <Button type="button" variant={confirmVariant} onClick={onConfirm} disabled={pending}>
            {confirmLabel ?? tCommon('confirm')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
