'use client';

import { useState, useTransition } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog } from '@/components/ui/dialog';
import { Input, Label, Textarea } from '@/components/ui/input';
import { deleteMindmap, renameMindmap } from '@/lib/actions/mindmaps';

interface MindmapCardActionsProps {
  id: string;
  title: string;
  description: string | null;
}

export function MindmapCardActions({ id, title, description }: MindmapCardActionsProps) {
  const t = useTranslations('mindmaps');
  const [open, setOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleRename = (formData: FormData) => {
    const newTitle = String(formData.get('title') ?? '').trim();
    if (!newTitle) return;
    const newDescription = String(formData.get('description') ?? '').trim();
    startTransition(async () => {
      await renameMindmap(id, newTitle, newDescription);
      setOpen(false);
    });
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    setConfirmDeleteOpen(false);
    startTransition(async () => {
      await deleteMindmap(id);
    });
  };

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('rename')}
        title={t('rename')}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        aria-label={t('delete')}
        title={t('delete')}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title={t('renameTitle')}>
        <form className="space-y-4" action={handleRename}>
          <div>
            <Label htmlFor={`rename-title-${id}`}>{t('titleLabel')}</Label>
            <Input
              id={`rename-title-${id}`}
              name="title"
              defaultValue={title}
              maxLength={120}
              required
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor={`rename-description-${id}`}>
              {t('descriptionLabel')}{' '}
              <span className="font-normal text-slate-400">({t('optional')})</span>
            </Label>
            <Textarea
              id={`rename-description-${id}`}
              name="description"
              defaultValue={description ?? ''}
              maxLength={500}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {t('save')}
            </Button>
          </div>
        </form>
      </Dialog>
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title={t('delete')}
        description={t('deleteConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        pending={pending}
      />
    </div>
  );
}
