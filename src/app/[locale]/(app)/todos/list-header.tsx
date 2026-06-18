'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog } from '@/components/ui/dialog';
import { updateList, deleteList } from '@/lib/actions/todos';
import { ListForm } from './list-form';

interface ListHeaderProps {
  list: { id: string; name: string; color: string };
  openCount: number;
}

export function ListHeader({ list, openCount }: ListHeaderProps) {
  const t = useTranslations('todos');
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    setConfirmDeleteOpen(false);
    startTransition(async () => {
      await deleteList(list.id);
      router.push('/todos');
    });
  };

  return (
    <div className="space-y-3">
      <Link
        href="/todos"
        className="inline-flex h-8 items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('list.back')}
      </Link>

      <div className="flex items-center gap-3">
        <span
          className="h-9 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: list.color }}
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
            {list.name}
          </h1>
          <p className="text-sm text-slate-500">
            {openCount === 0 ? t('lists.allDone') : t('lists.openCount', { count: openCount })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditing(true)}
          aria-label={t('list.edit')}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label={t('list.delete')}
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={editing} onClose={() => setEditing(false)} title={t('listDialog.editTitle')}>
        <ListForm
          key={editing ? 'open' : 'closed'}
          initialName={list.name}
          initialColor={list.color}
          submitLabel={t('listDialog.save')}
          onSubmit={async (name, color) => {
            await updateList(list.id, { name, color });
            setEditing(false);
          }}
        />
      </Dialog>
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title={t('list.delete')}
        description={t('list.deleteConfirm', { name: list.name })}
        confirmLabel={t('list.delete')}
      />
    </div>
  );
}
