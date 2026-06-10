'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { createList } from '@/lib/actions/todos';
import { ListForm } from './list-form';

/** "New list" trigger button plus the create dialog. */
export function NewListDialog() {
  const t = useTranslations('todos');
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {t('lists.newList')}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title={t('listDialog.createTitle')}>
        <ListForm
          key={open ? 'open' : 'closed'}
          submitLabel={t('listDialog.create')}
          onSubmit={async (name, color) => {
            await createList(name, color);
            setOpen(false);
          }}
        />
      </Dialog>
    </>
  );
}
