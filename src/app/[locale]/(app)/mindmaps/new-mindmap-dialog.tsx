'use client';

import { useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input, Label, Textarea } from '@/components/ui/input';
import { createMindmap } from '@/lib/actions/mindmaps';

export function NewMindmapDialog() {
  const t = useTranslations('mindmaps');
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const title = String(formData.get('title') ?? '').trim();
    if (!title) return;
    const description = String(formData.get('description') ?? '').trim();
    startTransition(async () => {
      // Redirects to the new map's editor page on success.
      await createMindmap({ title, description: description || undefined });
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="shrink-0">
        <Plus className="h-4 w-4" />
        {t('new')}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title={t('newTitle')}>
        <form className="space-y-4" action={handleSubmit}>
          <div>
            <Label htmlFor="mindmap-title">{t('titleLabel')}</Label>
            <Input
              id="mindmap-title"
              name="title"
              placeholder={t('titlePlaceholder')}
              maxLength={120}
              required
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="mindmap-description">
              {t('descriptionLabel')}{' '}
              <span className="font-normal text-slate-400">({t('optional')})</span>
            </Label>
            <Textarea
              id="mindmap-description"
              name="description"
              placeholder={t('descriptionPlaceholder')}
              maxLength={500}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t('creating') : t('create')}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
